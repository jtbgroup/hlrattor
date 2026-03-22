package com.hlrattor.service;

import com.hlrattor.dto.ProjectDtos.*;
import com.hlrattor.entity.*;
import com.hlrattor.entity.AppUser.Role;
import com.hlrattor.repository.*;
import com.hlrattor.service.ProjectExceptions.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepo;
    private final ProjectStatusHistoryRepository statusHistoryRepo;
    private final ProjectManagerHistoryRepository pmHistoryRepo;
    private final DueDateHistoryRepository dueDateHistoryRepo;
    private final BudgetLineRepository budgetLineRepo;
    private final ProjectProgressionRepository progressionRepo;
    private final AppUserRepository userRepo;

    public ProjectService(
            ProjectRepository projectRepo,
            ProjectStatusHistoryRepository statusHistoryRepo,
            ProjectManagerHistoryRepository pmHistoryRepo,
            DueDateHistoryRepository dueDateHistoryRepo,
            BudgetLineRepository budgetLineRepo,
            ProjectProgressionRepository progressionRepo,
            AppUserRepository userRepo) {
        this.projectRepo = projectRepo;
        this.statusHistoryRepo = statusHistoryRepo;
        this.pmHistoryRepo = pmHistoryRepo;
        this.dueDateHistoryRepo = dueDateHistoryRepo;
        this.budgetLineRepo = budgetLineRepo;
        this.progressionRepo = progressionRepo;
        this.userRepo = userRepo;
    }

    // ─── Queries ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ProjectSummaryDto> listProjects() {
        return projectRepo.findAll().stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectDetailDto getProject(UUID id) {
        Project project = requireProject(id);
        return toDetail(project);
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    public ProjectDetailDto createProject(CreateProjectDto dto) {
        if (projectRepo.existsByReference(dto.reference())) {
            throw new DuplicateReferenceException(dto.reference());
        }

        AppUser currentUser = currentUser();
        AppUser pm = requireProjectManager(dto.projectManagerId());

        Project project = new Project();
        project.setName(dto.name());
        project.setReference(dto.reference());
        project.setImputationCode(dto.imputationCode());
        project.setPordBia(dto.pordBia());
        project.setPordProject(dto.pordProject());
        project.setCreatedBy(currentUser);
        project = projectRepo.save(project);

        // Initial status history
        ProjectStatusHistory statusEntry = new ProjectStatusHistory();
        statusEntry.setProject(project);
        statusEntry.setStatus(dto.initialStatus());
        statusEntry.setBusinessDate(dto.statusDate());
        statusEntry.setChangedBy(currentUser);
        statusHistoryRepo.save(statusEntry);

        // Initial project manager history
        ProjectManagerHistory pmEntry = new ProjectManagerHistory();
        pmEntry.setProject(project);
        pmEntry.setProjectManager(pm);
        pmEntry.setStartDate(dto.statusDate());
        pmEntry.setAssignedBy(currentUser);
        pmHistoryRepo.save(pmEntry);

        return toDetail(project);
    }

    // ─── Update project fields ────────────────────────────────────────────────

    public ProjectDetailDto updateProject(UUID id, UpdateProjectDto dto) {
        Project project = requireProject(id);
        requireEditable(project);
        requireAuthorized(project);

        boolean isAdmin = currentUserIsAdmin();

        if (isAdmin) {
            if (dto.name() != null)
                project.setName(dto.name());
            if (dto.reference() != null) {
                if (!dto.reference().equals(project.getReference())
                        && projectRepo.existsByReferenceAndIdNot(dto.reference(), id)) {
                    throw new DuplicateReferenceException(dto.reference());
                }
                project.setReference(dto.reference());
            }
        }

        // Both roles can update
        if (dto.imputationCode() != null)
            project.setImputationCode(dto.imputationCode());
        if (dto.pordBia() != null)
            project.setPordBia(dto.pordBia());
        if (dto.pordProject() != null)
            project.setPordProject(dto.pordProject());

        return toDetail(projectRepo.save(project));
    }

    // ─── Status ───────────────────────────────────────────────────────────────

    public ProjectDetailDto changeStatus(UUID id, StatusChangeDto dto) {
        Project project = requireProject(id);
        requireAuthorized(project);

        ProjectStatusHistory entry = new ProjectStatusHistory();
        entry.setProject(project);
        entry.setStatus(dto.status());
        entry.setBusinessDate(dto.businessDate());
        entry.setChangedBy(currentUser());
        statusHistoryRepo.save(entry);

        return toDetail(project);
    }

    // ─── Project manager ──────────────────────────────────────────────────────

    public ProjectDetailDto changeProjectManager(UUID id, ProjectManagerChangeDto dto) {
        Project project = requireProject(id);
        AppUser newPm = requireProjectManager(dto.projectManagerId());

        // Close current active entry
        pmHistoryRepo.findByProjectIdAndEndDateIsNull(id)
                .ifPresent(current -> {
                    current.setEndDate(LocalDate.now());
                    pmHistoryRepo.save(current);
                });

        // Open new entry
        ProjectManagerHistory entry = new ProjectManagerHistory();
        entry.setProject(project);
        entry.setProjectManager(newPm);
        entry.setStartDate(LocalDate.now());
        entry.setAssignedBy(currentUser());
        pmHistoryRepo.save(entry);

        return toDetail(project);
    }

    // ─── Due date ─────────────────────────────────────────────────────────────

    public ProjectDetailDto changeDueDate(UUID id, DueDateChangeDto dto) {
        Project project = requireProject(id);
        requireEditable(project);
        requireAuthorized(project);

        DueDateHistory entry = new DueDateHistory();
        entry.setProject(project);
        entry.setDueDate(dto.dueDate());
        entry.setChangedBy(currentUser());
        dueDateHistoryRepo.save(entry);

        return toDetail(project);
    }

    // ─── Budget lines ─────────────────────────────────────────────────────────

    public ProjectDetailDto addBudgetLine(UUID id, BudgetLineDto dto) {
        Project project = requireProject(id);
        requireEditable(project);
        requireAuthorized(project);

        BudgetLine line = new BudgetLine();
        line.setProject(project);
        line.setType(dto.type());
        line.setAmount(dto.amount());
        line.setDate(dto.date());
        line.setCreatedBy(currentUser());
        budgetLineRepo.save(line);

        return toDetail(project);
    }

    public ProjectDetailDto updateBudgetLine(UUID projectId, UUID lineId, BudgetLineDto dto) {
        Project project = requireProject(projectId);
        requireEditable(project);
        requireAuthorized(project);

        BudgetLine line = budgetLineRepo.findById(lineId)
                .filter(l -> l.getProject().getId().equals(projectId))
                .orElseThrow(() -> new BudgetLineNotFoundException(lineId));

        line.setType(dto.type());
        line.setAmount(dto.amount());
        line.setDate(dto.date());
        line.setUpdatedBy(currentUser());
        budgetLineRepo.save(line);

        return toDetail(project);
    }

    public ProjectDetailDto deleteBudgetLine(UUID projectId, UUID lineId) {
        Project project = requireProject(projectId);
        requireEditable(project);
        requireAuthorized(project);

        BudgetLine line = budgetLineRepo.findById(lineId)
                .filter(l -> l.getProject().getId().equals(projectId))
                .orElseThrow(() -> new BudgetLineNotFoundException(lineId));

        budgetLineRepo.delete(line);
        return toDetail(project);
    }

    // ─── Progression ──────────────────────────────────────────────────────────

    public ProjectDetailDto addProgression(UUID id, ProgressionDto dto) {
        Project project = requireProject(id);
        requireEditable(project);
        requireAuthorized(project);

        ProjectProgression entry = new ProjectProgression();
        entry.setProject(project);
        entry.setProgressionValue(dto.progressionValue());
        entry.setProgressionDate(dto.progressionDate());
        entry.setRecordedBy(currentUser());
        progressionRepo.save(entry);

        return toDetail(project);
    }

    // ─── Internal helpers ─────────────────────────────────────────────────────

    private Project requireProject(UUID id) {
        return projectRepo.findById(id).orElseThrow(() -> new ProjectNotFoundException(id));
    }

    private AppUser requireProjectManager(UUID userId) {
        AppUser user = userRepo.findById(userId)
                .orElseThrow(() -> new InvalidProjectManagerException());
        if (!user.isEnabled() || !user.hasRole(Role.PROJECT_MANAGER)) {
            throw new InvalidProjectManagerException();
        }
        return user;
    }

    private void requireEditable(Project project) {
        ProjectStatus current = statusHistoryRepo
                .findTopByProjectIdOrderByChangedAtDesc(project.getId())
                .map(ProjectStatusHistory::getStatus)
                .orElse(ProjectStatus.DRAFT);
        if (current.isReadOnly()) {
            throw new ProjectReadOnlyException();
        }
    }

    private void requireAuthorized(Project project) {
        if (currentUserIsAdmin())
            return;
        // Must be the assigned PM
        boolean isAssigned = pmHistoryRepo
                .findByProjectIdAndEndDateIsNull(project.getId())
                .map(h -> h.getProjectManager().getUsername().equals(currentUsername()))
                .orElse(false);
        if (!isAssigned) {
            throw new UnauthorizedProjectAccessException();
        }
    }

    private boolean currentUserIsAdmin() {
        return SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private String currentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private AppUser currentUser() {
        return userRepo.findByUsername(currentUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }

    // ─── Mapping ──────────────────────────────────────────────────────────────

    private ProjectSummaryDto toSummary(Project project) {
        UUID id = project.getId();

        ProjectStatus currentStatus = statusHistoryRepo
                .findTopByProjectIdOrderByChangedAtDesc(id)
                .map(ProjectStatusHistory::getStatus)
                .orElse(null);

        String currentPm = pmHistoryRepo
                .findByProjectIdAndEndDateIsNull(id)
                .map(h -> h.getProjectManager().getUsername())
                .orElse(null);

        LocalDate currentDueDate = dueDateHistoryRepo
                .findTopByProjectIdOrderByChangedAtDesc(id)
                .map(DueDateHistory::getDueDate)
                .orElse(null);

        Integer currentProgression = progressionRepo
                .findTopByProjectIdOrderByProgressionDateDescRecordedAtDesc(id)
                .map(ProjectProgression::getProgressionValue)
                .orElse(null);

        var totalBudget = budgetLineRepo.sumAmountByProjectId(id);

        return new ProjectSummaryDto(id, project.getReference(), project.getName(),
                currentStatus, currentPm, currentDueDate, currentProgression, totalBudget);
    }

    private ProjectDetailDto toDetail(Project project) {
        UUID id = project.getId();

        ProjectStatus currentStatus = statusHistoryRepo
                .findTopByProjectIdOrderByChangedAtDesc(id)
                .map(ProjectStatusHistory::getStatus)
                .orElse(null);

        String currentPm = pmHistoryRepo
                .findByProjectIdAndEndDateIsNull(id)
                .map(h -> h.getProjectManager().getUsername())
                .orElse(null);

        LocalDate currentDueDate = dueDateHistoryRepo
                .findTopByProjectIdOrderByChangedAtDesc(id)
                .map(DueDateHistory::getDueDate)
                .orElse(null);

        Integer currentProgression = progressionRepo
                .findTopByProjectIdOrderByProgressionDateDescRecordedAtDesc(id)
                .map(ProjectProgression::getProgressionValue)
                .orElse(null);

        var totalBudget = budgetLineRepo.sumAmountByProjectId(id);

        List<ProjectStatusHistoryDto> statusHistory = statusHistoryRepo
                .findByProjectIdOrderByChangedAtAsc(id).stream()
                .map(h -> new ProjectStatusHistoryDto(h.getId(), h.getStatus(),
                        h.getBusinessDate(), h.getChangedBy().getUsername(), h.getChangedAt()))
                .toList();

        List<ProjectManagerHistoryDto> pmHistory = pmHistoryRepo
                .findByProjectIdOrderByStartDateAsc(id).stream()
                .map(h -> new ProjectManagerHistoryDto(h.getId(),
                        h.getProjectManager().getUsername(), h.getStartDate(), h.getEndDate(),
                        h.getAssignedBy().getUsername(), h.getAssignedAt()))
                .toList();

        List<DueDateHistoryDto> dueDateHistory = dueDateHistoryRepo
                .findByProjectIdOrderByChangedAtAsc(id).stream()
                .map(h -> new DueDateHistoryDto(h.getId(), h.getDueDate(),
                        h.getChangedBy().getUsername(), h.getChangedAt()))
                .toList();

        List<BudgetLineResponseDto> budgetLines = budgetLineRepo
                .findByProjectIdOrderByDateAsc(id).stream()
                .map(b -> new BudgetLineResponseDto(b.getId(), b.getType(), b.getAmount(),
                        b.getDate(), b.getCreatedBy().getUsername(), b.getCreatedAt(),
                        b.getUpdatedBy() != null ? b.getUpdatedBy().getUsername() : null,
                        b.getUpdatedAt()))
                .toList();

        List<ProgressionResponseDto> progressionHistory = progressionRepo
                .findByProjectIdOrderByProgressionDateAsc(id).stream()
                .map(p -> new ProgressionResponseDto(p.getId(), p.getProgressionValue(),
                        p.getProgressionDate(), p.getRecordedBy().getUsername(), p.getRecordedAt()))
                .toList();

        return new ProjectDetailDto(id, project.getReference(), project.getName(),
                project.getImputationCode(), project.getPordBia(), project.getPordProject(),
                project.getCreatedBy().getUsername(), project.getCreatedAt(),
                currentStatus, currentPm, currentDueDate, currentProgression, totalBudget,
                statusHistory, pmHistory, dueDateHistory, budgetLines, progressionHistory);
    }
}

package com.hlrattor.service;

import com.hlrattor.dto.*;
import com.hlrattor.entity.*;
import com.hlrattor.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final BudgetLineRepository budgetLineRepository;
    private final AppUserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository,
                          BudgetLineRepository budgetLineRepository,
                          AppUserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.budgetLineRepository = budgetLineRepository;
        this.userRepository = userRepository;
    }

    // -------------------------------------------------------------------------
    // Queries
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<ProjectSummaryDto> listProjects() {
        return projectRepository.findAll().stream()
                .map(this::toSummaryDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectDetailDto getProject(UUID id) {
        Project project = findProjectOrThrow(id);
        return toDetailDto(project);
    }

    // -------------------------------------------------------------------------
    // Create
    // -------------------------------------------------------------------------

    public ProjectDetailDto createProject(CreateProjectDto dto) {
        AppUser actor = currentUser();

        if (projectRepository.existsByReference(dto.reference())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Project reference already exists");
        }

        AppUser pm = findEnabledProjectManagerOrThrow(dto.projectManagerId());

        Project project = new Project();
        project.setName(dto.name());
        project.setReference(dto.reference());
        project.setSciformaCode(dto.sciformaCode());
        project.setPordBia(dto.pordBia());
        project.setPordProject(dto.pordProject());
        project.setCreatedBy(actor);

        // Initial status history
        ProjectStatusHistory statusEntry = new ProjectStatusHistory();
        statusEntry.setProject(project);
        statusEntry.setStatus(dto.initialStatus());
        statusEntry.setBusinessDate(dto.statusDate());
        statusEntry.setChangedBy(actor);
        project.getStatusHistory().add(statusEntry);

        // Initial project manager history
        ProjectManagerHistory pmEntry = new ProjectManagerHistory();
        pmEntry.setProject(project);
        pmEntry.setProjectManager(pm);
        pmEntry.setStartDate(dto.statusDate());
        pmEntry.setAssignedBy(actor);
        project.getManagerHistory().add(pmEntry);

        projectRepository.save(project);
        return toDetailDto(project);
    }

    // -------------------------------------------------------------------------
    // Update project fields
    // -------------------------------------------------------------------------

    public ProjectDetailDto updateProject(UUID id, UpdateProjectDto dto) {
        AppUser actor = currentUser();
        Project project = findProjectOrThrow(id);

        assertNotReadOnly(project);
        assertCanEdit(project, actor);

        boolean isAdmin = hasRole(actor, AppUser.Role.ADMIN);

        if (isAdmin) {
            if (dto.name() != null) project.setName(dto.name());
            if (dto.reference() != null) {
                if (projectRepository.existsByReferenceAndIdNot(dto.reference(), id)) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Project reference already exists");
                }
                project.setReference(dto.reference());
            }
        }

        // Both ADMIN and assigned PM can update these
        if (dto.sciformaCode() != null) project.setSciformaCode(dto.sciformaCode());
        if (dto.pordBia() != null) project.setPordBia(dto.pordBia());
        if (dto.pordProject() != null) project.setPordProject(dto.pordProject());

        projectRepository.save(project);
        return toDetailDto(project);
    }

    // -------------------------------------------------------------------------
    // Status change
    // -------------------------------------------------------------------------

    public ProjectDetailDto changeStatus(UUID id, StatusChangeDto dto) {
        AppUser actor = currentUser();
        Project project = findProjectOrThrow(id);

        // Read-only projects can only transition back to an active status
        if (project.isReadOnly() && dto.status().isReadOnly()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This project is closed or canceled. Change its status to edit it.");
        }

        assertCanEdit(project, actor);

        ProjectStatusHistory entry = new ProjectStatusHistory();
        entry.setProject(project);
        entry.setStatus(dto.status());
        entry.setBusinessDate(dto.businessDate());
        entry.setChangedBy(actor);
        project.getStatusHistory().add(entry);

        projectRepository.save(project);
        return toDetailDto(project);
    }

    // -------------------------------------------------------------------------
    // Project manager change
    // -------------------------------------------------------------------------

    public ProjectDetailDto changeProjectManager(UUID id, ProjectManagerChangeDto dto) {
        AppUser actor = currentUser();
        Project project = findProjectOrThrow(id);

        assertNotReadOnly(project);

        AppUser newPm = findEnabledProjectManagerOrThrow(dto.projectManagerId());

        // Close current active entry
        project.getManagerHistory().stream()
                .filter(h -> h.getEndDate() == null)
                .forEach(h -> h.setEndDate(LocalDate.now()));

        // Open new entry
        ProjectManagerHistory newEntry = new ProjectManagerHistory();
        newEntry.setProject(project);
        newEntry.setProjectManager(newPm);
        newEntry.setStartDate(LocalDate.now());
        newEntry.setAssignedBy(actor);
        project.getManagerHistory().add(newEntry);

        projectRepository.save(project);
        return toDetailDto(project);
    }

    // -------------------------------------------------------------------------
    // Due date change
    // -------------------------------------------------------------------------

    public ProjectDetailDto changeDueDate(UUID id, DueDateChangeDto dto) {
        AppUser actor = currentUser();
        Project project = findProjectOrThrow(id);

        assertNotReadOnly(project);
        assertCanEdit(project, actor);

        DueDateHistory entry = new DueDateHistory();
        entry.setProject(project);
        entry.setDueDate(dto.dueDate());
        entry.setChangedBy(actor);
        project.getDueDateHistory().add(entry);

        projectRepository.save(project);
        return toDetailDto(project);
    }

    // -------------------------------------------------------------------------
    // Budget lines
    // -------------------------------------------------------------------------

    public ProjectDetailDto addBudgetLine(UUID id, BudgetLineDto dto) {
        AppUser actor = currentUser();
        Project project = findProjectOrThrow(id);

        assertNotReadOnly(project);
        assertCanEdit(project, actor);

        BudgetLine line = new BudgetLine();
        line.setProject(project);
        line.setType(dto.type());
        line.setAmount(dto.amount());
        line.setDate(dto.date());
        line.setPordReference(dto.pordReference());
        line.setCreatedBy(actor);
        project.getBudgetLines().add(line);

        projectRepository.save(project);
        return toDetailDto(project);
    }

    public ProjectDetailDto updateBudgetLine(UUID id, UUID lineId, BudgetLineDto dto) {
        AppUser actor = currentUser();
        Project project = findProjectOrThrow(id);

        assertNotReadOnly(project);
        assertCanEdit(project, actor);

        BudgetLine line = project.getBudgetLines().stream()
                .filter(l -> l.getId().equals(lineId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget line not found"));

        line.setType(dto.type());
        line.setAmount(dto.amount());
        line.setDate(dto.date());
        line.setPordReference(dto.pordReference());
        line.setUpdatedBy(actor);

        projectRepository.save(project);
        return toDetailDto(project);
    }

    public ProjectDetailDto deleteBudgetLine(UUID id, UUID lineId) {
        AppUser actor = currentUser();
        Project project = findProjectOrThrow(id);

        assertNotReadOnly(project);
        assertCanEdit(project, actor);

        boolean removed = project.getBudgetLines()
                .removeIf(l -> l.getId().equals(lineId));

        if (!removed) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget line not found");
        }

        projectRepository.save(project);
        return toDetailDto(project);
    }

    // -------------------------------------------------------------------------
    // Mapping
    // -------------------------------------------------------------------------

    private ProjectSummaryDto toSummaryDto(Project p) {
        BigDecimal total = budgetLineRepository.sumAmountByProjectId(p.getId());

        AppUser pm = p.currentProjectManager();
        List<DueDateHistory> ddHistory = p.getDueDateHistory();
        LocalDate currentDueDate = ddHistory.isEmpty()
                ? null
                : ddHistory.get(ddHistory.size() - 1).getDueDate();

        return new ProjectSummaryDto(
                p.getId(),
                p.getReference(),
                p.getName(),
                p.currentStatus(),
                pm != null ? pm.getUsername() : null,
                currentDueDate,
                total
        );
    }

    private ProjectDetailDto toDetailDto(Project p) {
        BigDecimal total = p.getBudgetLines().stream()
                .map(BudgetLine::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        AppUser pm = p.currentProjectManager();
        List<DueDateHistory> ddHistory = p.getDueDateHistory();
        LocalDate currentDueDate = ddHistory.isEmpty()
                ? null
                : ddHistory.get(ddHistory.size() - 1).getDueDate();

        List<ProjectStatusHistoryDto> statusHistory = p.getStatusHistory().stream()
                .map(h -> new ProjectStatusHistoryDto(
                        h.getId(), h.getStatus(), h.getBusinessDate(),
                        h.getChangedBy().getUsername(), h.getChangedAt()))
                .toList();

        List<ProjectManagerHistoryDto> managerHistory = p.getManagerHistory().stream()
                .map(h -> new ProjectManagerHistoryDto(
                        h.getId(), h.getProjectManager().getUsername(),
                        h.getStartDate(), h.getEndDate(),
                        h.getAssignedBy().getUsername(), h.getAssignedAt()))
                .toList();

        List<DueDateHistoryDto> dueDateHistory = p.getDueDateHistory().stream()
                .map(h -> new DueDateHistoryDto(
                        h.getId(), h.getDueDate(),
                        h.getChangedBy().getUsername(), h.getChangedAt()))
                .toList();

        List<BudgetLineResponseDto> budgetLines = p.getBudgetLines().stream()
                .map(l -> new BudgetLineResponseDto(
                        l.getId(), l.getType(), l.getAmount(), l.getDate(),
                        l.getPordReference(),
                        l.getCreatedBy().getUsername(), l.getCreatedAt(),
                        l.getUpdatedBy() != null ? l.getUpdatedBy().getUsername() : null,
                        l.getUpdatedAt()))
                .toList();

        return new ProjectDetailDto(
                p.getId(), p.getReference(), p.getName(),
                p.getSciformaCode(), p.getPordBia(), p.getPordProject(),
                p.getCreatedBy().getUsername(), p.getCreatedAt(),
                p.currentStatus(),
                pm != null ? pm.getUsername() : null,
                currentDueDate, total,
                statusHistory, managerHistory, dueDateHistory, budgetLines
        );
    }

    // -------------------------------------------------------------------------
    // Authorization helpers
    // -------------------------------------------------------------------------

    private void assertNotReadOnly(Project project) {
        if (project.isReadOnly()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This project is closed or canceled. Change its status to edit it.");
        }
    }

    private void assertCanEdit(Project project, AppUser actor) {
        if (hasRole(actor, AppUser.Role.ADMIN)) return;
        AppUser currentPm = project.currentProjectManager();
        if (currentPm != null && currentPm.getId().equals(actor.getId())) return;
        throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "You are not authorized to edit this project");
    }

    private boolean hasRole(AppUser user, AppUser.Role role) {
        return user.hasRole(role);
    }

    private AppUser currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private Project findProjectOrThrow(UUID id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    }

    private AppUser findEnabledProjectManagerOrThrow(UUID id) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found"));
        if (!user.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is disabled");
        }
        if (!hasRole(user, AppUser.Role.PROJECT_MANAGER)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The selected user is not a project manager");
        }
        return user;
    }
}
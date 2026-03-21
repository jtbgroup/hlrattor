package com.hlrattor.controller;

import com.hlrattor.dto.ProjectDtos.*;
import com.hlrattor.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // ─── List / Detail ────────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<ProjectSummaryDto> listProjects() {
        return projectService.listProjects();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ProjectDetailDto getProject(@PathVariable UUID id) {
        return projectService.getProject(id);
    }

    // ─── Create / Update ──────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectDetailDto> createProject(@Valid @RequestBody CreateProjectDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ProjectDetailDto updateProject(@PathVariable UUID id,
                                          @Valid @RequestBody UpdateProjectDto dto) {
        return projectService.updateProject(id, dto);
    }

    // ─── Status ───────────────────────────────────────────────────────────────

    @PostMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ProjectDetailDto changeStatus(@PathVariable UUID id,
                                         @Valid @RequestBody StatusChangeDto dto) {
        return projectService.changeStatus(id, dto);
    }

    // ─── Project manager ──────────────────────────────────────────────────────

    @PostMapping("/{id}/project-manager")
    @PreAuthorize("hasRole('ADMIN')")
    public ProjectDetailDto changeProjectManager(@PathVariable UUID id,
                                                  @Valid @RequestBody ProjectManagerChangeDto dto) {
        return projectService.changeProjectManager(id, dto);
    }

    // ─── Due date ─────────────────────────────────────────────────────────────

    @PostMapping("/{id}/due-date")
    @PreAuthorize("isAuthenticated()")
    public ProjectDetailDto changeDueDate(@PathVariable UUID id,
                                          @Valid @RequestBody DueDateChangeDto dto) {
        return projectService.changeDueDate(id, dto);
    }

    // ─── Budget lines ─────────────────────────────────────────────────────────

    @PostMapping("/{id}/budget-lines")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectDetailDto> addBudgetLine(@PathVariable UUID id,
                                                           @Valid @RequestBody BudgetLineDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.addBudgetLine(id, dto));
    }

    @PutMapping("/{id}/budget-lines/{lineId}")
    @PreAuthorize("isAuthenticated()")
    public ProjectDetailDto updateBudgetLine(@PathVariable UUID id,
                                              @PathVariable UUID lineId,
                                              @Valid @RequestBody BudgetLineDto dto) {
        return projectService.updateBudgetLine(id, lineId, dto);
    }

    @DeleteMapping("/{id}/budget-lines/{lineId}")
    @PreAuthorize("isAuthenticated()")
    public ProjectDetailDto deleteBudgetLine(@PathVariable UUID id,
                                              @PathVariable UUID lineId) {
        return projectService.deleteBudgetLine(id, lineId);
    }

    // ─── Progression ──────────────────────────────────────────────────────────

    @PostMapping("/{id}/progressions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectDetailDto> addProgression(@PathVariable UUID id,
                                                            @Valid @RequestBody ProgressionDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.addProgression(id, dto));
    }
}

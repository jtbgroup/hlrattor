package com.hlrattor.controller;

import com.hlrattor.dto.*;
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

    // GET /api/projects — any authenticated user
    @GetMapping
    public List<ProjectSummaryDto> listProjects() {
        return projectService.listProjects();
    }

    // GET /api/projects/{id} — any authenticated user
    @GetMapping("/{id}")
    public ProjectDetailDto getProject(@PathVariable UUID id) {
        return projectService.getProject(id);
    }

    // POST /api/projects — ADMIN only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectDetailDto> createProject(@Valid @RequestBody CreateProjectDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(dto));
    }

    // PUT /api/projects/{id} — ADMIN or assigned PM (enforced in service)
    @PutMapping("/{id}")
    public ProjectDetailDto updateProject(@PathVariable UUID id,
                                          @Valid @RequestBody UpdateProjectDto dto) {
        return projectService.updateProject(id, dto);
    }

    // POST /api/projects/{id}/status — ADMIN or assigned PM (enforced in service)
    @PostMapping("/{id}/status")
    public ProjectDetailDto changeStatus(@PathVariable UUID id,
                                         @Valid @RequestBody StatusChangeDto dto) {
        return projectService.changeStatus(id, dto);
    }

    // POST /api/projects/{id}/project-manager — ADMIN only
    @PostMapping("/{id}/project-manager")
    @PreAuthorize("hasRole('ADMIN')")
    public ProjectDetailDto changeProjectManager(@PathVariable UUID id,
                                                  @Valid @RequestBody ProjectManagerChangeDto dto) {
        return projectService.changeProjectManager(id, dto);
    }

    // POST /api/projects/{id}/due-date — ADMIN or assigned PM (enforced in service)
    @PostMapping("/{id}/due-date")
    public ProjectDetailDto changeDueDate(@PathVariable UUID id,
                                          @Valid @RequestBody DueDateChangeDto dto) {
        return projectService.changeDueDate(id, dto);
    }

    // POST /api/projects/{id}/budget-lines — ADMIN or assigned PM (enforced in service)
    @PostMapping("/{id}/budget-lines")
    public ResponseEntity<ProjectDetailDto> addBudgetLine(@PathVariable UUID id,
                                                           @Valid @RequestBody BudgetLineDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.addBudgetLine(id, dto));
    }

    // PUT /api/projects/{id}/budget-lines/{lineId}
    @PutMapping("/{id}/budget-lines/{lineId}")
    public ProjectDetailDto updateBudgetLine(@PathVariable UUID id,
                                              @PathVariable UUID lineId,
                                              @Valid @RequestBody BudgetLineDto dto) {
        return projectService.updateBudgetLine(id, lineId, dto);
    }

    // DELETE /api/projects/{id}/budget-lines/{lineId}
    @DeleteMapping("/{id}/budget-lines/{lineId}")
    public ProjectDetailDto deleteBudgetLine(@PathVariable UUID id,
                                              @PathVariable UUID lineId) {
        return projectService.deleteBudgetLine(id, lineId);
    }
}

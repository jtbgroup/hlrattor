package com.hlrattor.repository;

import com.hlrattor.entity.BudgetLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface BudgetLineRepository extends JpaRepository<BudgetLine, UUID> {
    List<BudgetLine> findByProjectIdOrderByDateAsc(UUID projectId);

    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM BudgetLine b WHERE b.project.id = :projectId")
    BigDecimal sumAmountByProjectId(UUID projectId);
}

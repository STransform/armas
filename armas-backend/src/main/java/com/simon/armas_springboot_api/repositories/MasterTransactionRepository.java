package com.simon.armas_springboot_api.repositories;

import com.simon.armas_springboot_api.dto.SentReportResponseDTO;
import com.simon.armas_springboot_api.models.Document;
import com.simon.armas_springboot_api.models.MasterTransaction;
import com.simon.armas_springboot_api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import java.util.List;

@Repository
public interface MasterTransactionRepository extends JpaRepository<MasterTransaction, Integer> {
    @Query("SELECT m FROM MasterTransaction m WHERE CONCAT(m.id, ' ', m.transactiondocument.id) LIKE %:keyword%")
    List<MasterTransaction> findByTransactionDocumentIdKeyword(@Param("keyword") String keyword);

    @Query("SELECT z FROM MasterTransaction z WHERE CONCAT(z.id, ' ', z.createdBy) LIKE %?1%")
    List<MasterTransaction> findTransactionByUsername(String orgtrans);

    @Query("FROM MasterTransaction m WHERE m.user.id = :userid")
    List<MasterTransaction> findTransactionByOrg(@Param("userid") Long id);

    @Query("FROM MasterTransaction m WHERE m.user2.id = :expertid")
    List<MasterTransaction> findTransactionByExpert(@Param("expertid") Long expertId);

    @Query("SELECT m FROM MasterTransaction m WHERE m.organization.id = :orgcode")
    List<MasterTransaction> findAllTransactionByOrg(@Param("orgcode") String orgcode);

    @Query("SELECT m FROM MasterTransaction m INNER JOIN m.organization o WHERE o.orgname = ?1")
    List<MasterTransaction> getOrganizationByOrganizationName(String orgname);

    @Query("FROM MasterTransaction m WHERE m.reportcategory = :reportcategory AND m.transactiondocument.id = :docid AND m.organization.id = :theoid AND m.budgetYear.fiscalYear = :fiscalYear")
    List<MasterTransaction> findTransactionByDocumentId(
              @Param("reportcategory") String reportcategory,
              @Param("docid") String id,
              @Param("theoid") String oid,
              @Param("fiscalYear") String fiscalYear);
                                                        
   @Query("FROM MasterTransaction m WHERE m.reportcategory = :reportcategory AND m.transactiondocument.id = :docid AND m.budgetYear.fiscalYear = :fiscalYear")
   List<MasterTransaction> findNoneSendersByDocumentId(
       @Param("docid") String id,
       @Param("fiscalYear") String fiscalYear,
       @Param("reportcategory") String reportcategory);

    @Query("SELECT new com.simon.armas_springboot_api.dto.SentReportResponseDTO(" +
           "m.id, o.orgname, d.reportype, m.budgetYear.fiscalYear, m.createdDate, m.docname, m.reportstatus, m.remarks, " +
           "m.user.username, m.submittedByAuditor.username, m.response_needed) " +
           "FROM MasterTransaction m INNER JOIN m.organization o INNER JOIN m.transactiondocument d " +
           "LEFT JOIN m.user LEFT JOIN m.submittedByAuditor " +
           "WHERE m.reportstatus IN :statuses")
    List<SentReportResponseDTO> fetchDataByStatuses(@Param("statuses") List<String> statuses);
@Query("SELECT m FROM MasterTransaction m " +
       "LEFT JOIN FETCH m.organization " +
       "LEFT JOIN FETCH m.transactiondocument " +
       "LEFT JOIN FETCH m.submittedByAuditor " +
       "LEFT JOIN FETCH m.budgetYear " + // this
       "WHERE m.reportstatus = 'Rejected'")
List<MasterTransaction> findRejectedReports();

    @Query("SELECT COUNT(DISTINCT mt.organization) FROM MasterTransaction mt WHERE mt.transactiondocument IS NOT NULL")
    int countDistinctOrganizationsWithReports();

    @Query("SELECT m FROM MasterTransaction m WHERE m.transactiondocument.id = :transactionDocumentId")
    List<MasterTransaction> findByTransactionDocumentId(@Param("transactionDocumentId") String transactionDocumentId);
   @Query("SELECT m FROM MasterTransaction m " +
       "LEFT JOIN FETCH m.organization " +
       "LEFT JOIN FETCH m.transactiondocument " +
       "LEFT JOIN FETCH m.submittedByAuditor " +
       "LEFT JOIN FETCH m.budgetYear " + // Add this
       "WHERE m.reportstatus = :status")
   List<MasterTransaction> findByReportStatus(@Param("status") String reportStatus);

    @Query("SELECT m FROM MasterTransaction m WHERE m.user2.id = :userId AND m.reportstatus IN :statuses")
    List<MasterTransaction> findByUserAndStatuses(@Param("userId") Long userId,
            @Param("statuses") List<String> statuses);

    @Query("SELECT m FROM MasterTransaction m WHERE m.reportstatus = 'Rejected' AND m.submittedByAuditor.id = :userId")
    List<MasterTransaction> findRejectedReportsByAuditor(@Param("userId") Long userId);

    @Query("SELECT m FROM MasterTransaction m WHERE m.reportstatus = 'Approved'")
    List<MasterTransaction> findApprovedReports();

    @Query("SELECT m FROM MasterTransaction m WHERE m.reportstatus IN :reportstatuses AND m.user2.id = :userid")
    List<MasterTransaction> findSeniorAuditorTasks(
            @Param("reportstatuses") List<String> reportstatuses,
            @Param("userid") Long userid);

    @Query("SELECT m FROM MasterTransaction m " +
           "LEFT JOIN FETCH m.user " +
           "LEFT JOIN FETCH m.organization " +
           "LEFT JOIN FETCH m.user2 " +
           "LEFT JOIN FETCH m.transactiondocument " +
           "LEFT JOIN FETCH m.assignedBy " +
           "LEFT JOIN FETCH m.submittedByAuditor " +
           "WHERE m.user2.id = :userId AND m.reportstatus IN :statuses")
    List<MasterTransaction> findApproverTasks(
            @Param("userId") Long userId,
            @Param("statuses") List<String> statuses);

@Query("SELECT m FROM MasterTransaction m " +
       "LEFT JOIN FETCH m.user " +
       "LEFT JOIN FETCH m.organization " +
       "LEFT JOIN FETCH m.user2 " +
       "LEFT JOIN FETCH m.transactiondocument " +
       "LEFT JOIN FETCH m.assignedBy " +
       "LEFT JOIN FETCH m.submittedByAuditor " +
       "WHERE m.reportstatus IN :reportstatuses AND m.user2.id = :userid")
List<MasterTransaction> findCompletedApproverTasks(
        @Param("userid") Long userid,
        @Param("reportstatuses") List<String> reportstatuses);

    @Query("SELECT m FROM MasterTransaction m WHERE m.assignedBy.id = :userId")
    List<MasterTransaction> findTasksAssignedByArchiver(@Param("userId") Long userId);

    @Query("SELECT m FROM MasterTransaction m " +
           "LEFT JOIN FETCH m.user " +
           "LEFT JOIN FETCH m.organization " +
           "LEFT JOIN FETCH m.user2 " +
           "LEFT JOIN FETCH m.transactiondocument " +
           "LEFT JOIN FETCH m.assignedBy " +
           "WHERE m.user2.id = :userId AND m.reportstatus IN ('Assigned', 'Rejected')")
    List<MasterTransaction> findActiveSeniorAuditorTasks(@Param("userId") Long userId);

    @Query("SELECT m FROM MasterTransaction m " +
           "LEFT JOIN FETCH m.user " +
           "LEFT JOIN FETCH m.organization " +
           "LEFT JOIN FETCH m.user2 " +
           "LEFT JOIN FETCH m.transactiondocument " +
           "LEFT JOIN FETCH m.assignedBy " +
           "WHERE m.submittedByAuditor.id = :userId AND m.reportstatus = 'Approved'")
    List<MasterTransaction> findApprovedSeniorAuditorTasks(@Param("userId") Long userId);
 @Query("SELECT m FROM MasterTransaction m " +
       "LEFT JOIN FETCH m.organization " +
       "LEFT JOIN FETCH m.transactiondocument " +
       "LEFT JOIN FETCH m.submittedByAuditor " +
       "LEFT JOIN FETCH m.budgetYear " + // to fetch BudgetYear
       "WHERE m.reportstatus = 'Under Review'")
List<MasterTransaction> findUnderReviewReports();

    @Query("SELECT m FROM MasterTransaction m " +
           "LEFT JOIN FETCH m.organization " +
           "LEFT JOIN FETCH m.transactiondocument " +
           "LEFT JOIN FETCH m.budgetYear " +
           "LEFT JOIN FETCH m.submittedByAuditor " +
           "WHERE m.reportstatus = 'Corrected'")
    List<MasterTransaction> findCorrectedReports();
    boolean existsByDocname(String docname);

    boolean existsByDocnameAndUserId(String docname, Long userId);

    boolean existsByDocnameAndUser(String docname, User user);

    @Query("SELECT t FROM MasterTransaction t WHERE t.reportstatus = :status AND t.user2.username = :username")
    List<MasterTransaction> findByReportstatusAndUser2Username(String status, String username);

    List<MasterTransaction> findByReportstatus(String reportstatus);

    List<MasterTransaction> findByReportstatusAndSubmittedByAuditor(String reportstatus, User submittedByAuditor);
    @Query("SELECT m FROM MasterTransaction m LEFT JOIN FETCH m.budgetYear WHERE m.id = :id")
    Optional<MasterTransaction> findByIdWithBudgetYear(@Param("id") Integer id);
    
}
package com.simon.armas_springboot_api.repositories;

import com.simon.armas_springboot_api.dto.SentReportResponseDTO;
import com.simon.armas_springboot_api.models.Document;
import com.simon.armas_springboot_api.models.MasterTransaction;
import com.simon.armas_springboot_api.models.User;
import com.simon.armas_springboot_api.models.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import java.util.List;

@Repository
public interface MasterTransactionRepository extends JpaRepository<MasterTransaction, Integer> {

    @Query("SELECT m FROM MasterTransaction m WHERE CONCAT(m.id, ' ', m.transactiondocument.id) LIKE %:keyword% ORDER BY m.createdDate DESC")
    List<MasterTransaction> findByTransactionDocumentIdKeyword(@Param("keyword") String keyword);

    @Query("SELECT z FROM MasterTransaction z WHERE CONCAT(z.id, ' ', z.createdBy) LIKE %?1% ORDER BY z.createdDate DESC")
    List<MasterTransaction> findTransactionByUsername(String orgtrans);

    @Query("FROM MasterTransaction m WHERE m.user.id = :userid ORDER BY m.createdDate DESC")
    List<MasterTransaction> findTransactionByOrg(@Param("userid") Long id);

    @Query("FROM MasterTransaction m WHERE m.user2.id = :expertid ORDER BY m.createdDate DESC")
    List<MasterTransaction> findTransactionByExpert(@Param("expertid") Long expertId);

    @Query("SELECT m FROM MasterTransaction m WHERE m.organization.id = :orgcode ORDER BY m.createdDate DESC")
    List<MasterTransaction> findAllTransactionByOrg(@Param("orgcode") String orgcode);

    @Query("SELECT m FROM MasterTransaction m INNER JOIN m.organization o WHERE o.orgname = ?1 ORDER BY m.createdDate DESC")
    List<MasterTransaction> getOrganizationByOrganizationName(String orgname);

    @Query("FROM MasterTransaction m WHERE m.reportcategory = :reportcategory AND m.transactiondocument.id = :docid AND m.organization.id = :theoid AND m.budgetYear.fiscalYear = :fiscalYear ORDER BY m.createdDate DESC")
    List<MasterTransaction> findTransactionByDocumentId(
            @Param("reportcategory") String reportcategory,
            @Param("docid") String id,
            @Param("theoid") String oid,
            @Param("fiscalYear") String fiscalYear);

    @Query("FROM MasterTransaction m WHERE m.reportcategory = :reportcategory AND m.transactiondocument.id = :docid AND m.budgetYear.fiscalYear = :fiscalYear ORDER BY m.createdDate DESC")
    List<MasterTransaction> findNoneSendersByDocumentId(
            @Param("docid") String id,
            @Param("fiscalYear") String fiscalYear,
            @Param("reportcategory") String reportcategory);

    @Query("SELECT new com.simon.armas_springboot_api.dto.SentReportResponseDTO(" +
           "m.id, o.orgname, d.reportype, m.budgetYear.fiscalYear, m.createdDate, m.docname, m.reportstatus, m.remarks, " +
           "m.user.username, m.submittedByAuditor.username, m.response_needed) " +
           "FROM MasterTransaction m INNER JOIN m.organization o INNER JOIN m.transactiondocument d " +
           "LEFT JOIN m.user LEFT JOIN m.submittedByAuditor " +
           "WHERE m.reportstatus IN :statuses ORDER BY m.createdDate DESC")
    List<SentReportResponseDTO> fetchDataByStatuses(@Param("statuses") List<String> statuses);

    @Query("SELECT m FROM MasterTransaction m " +
           "LEFT JOIN FETCH m.organization " +
           "LEFT JOIN FETCH m.transactiondocument " +
           "LEFT JOIN FETCH m.submittedByAuditor " +
           "LEFT JOIN FETCH m.budgetYear " +
           "WHERE m.reportstatus = 'Rejected' ORDER BY m.createdDate DESC")
    List<MasterTransaction> findRejectedReports();

    @Query("SELECT COUNT(DISTINCT mt.organization) FROM MasterTransaction mt WHERE mt.transactiondocument IS NOT NULL")
    int countDistinctOrganizationsWithReports();

    @Query("SELECT m FROM MasterTransaction m WHERE m.transactiondocument.id = :transactionDocumentId ORDER BY m.createdDate DESC")
    List<MasterTransaction> findByTransactionDocumentId(@Param("transactionDocumentId") String transactionDocumentId);

    @Query("SELECT m FROM MasterTransaction m " +
           "LEFT JOIN FETCH m.organization " +
           "LEFT JOIN FETCH m.transactiondocument " +
           "LEFT JOIN FETCH m.budgetYear " +
           "WHERE m.reportstatus = :status ORDER BY m.createdDate DESC")
    List<MasterTransaction> findByReportStatus(@Param("status") String reportStatus);

    @Query("SELECT m FROM MasterTransaction m WHERE m.user2.id = :userId AND m.reportstatus IN :statuses ORDER BY m.createdDate DESC")
    List<MasterTransaction> findByUserAndStatuses(@Param("userId") Long userId,
            @Param("statuses") List<String> statuses);

    @Query("SELECT m FROM MasterTransaction m WHERE m.reportstatus = 'Rejected' AND m.submittedByAuditor.id = :userId ORDER BY m.createdDate DESC")
    List<MasterTransaction> findRejectedReportsByAuditor(@Param("userId") Long userId);

    @Query("SELECT m FROM MasterTransaction m WHERE m.reportstatus = 'Approved' ORDER BY m.createdDate DESC")
    List<MasterTransaction> findApprovedReports();

    @Query("SELECT m FROM MasterTransaction m WHERE m.reportstatus IN :reportstatuses AND m.user2.id = :userid ORDER BY m.createdDate DESC")
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
           "WHERE m.user2.id = :userId AND m.reportstatus IN :statuses ORDER BY m.createdDate DESC")
    List<MasterTransaction> findApproverTasks(@Param("userId") Long userId, @Param("statuses") List<String> statuses);

    @Query("SELECT m FROM MasterTransaction m " +
           "LEFT JOIN FETCH m.user " +
           "LEFT JOIN FETCH m.organization " +
           "LEFT JOIN FETCH m.user2 " +
           "LEFT JOIN FETCH m.transactiondocument " +
           "LEFT JOIN FETCH m.assignedBy " +
           "LEFT JOIN FETCH m.submittedByAuditor " +
           "WHERE m.reportstatus IN :reportstatuses AND m.user2.id = :userid ORDER BY m.createdDate DESC")
    List<MasterTransaction> findCompletedApproverTasks(
            @Param("userid") Long userid,
            @Param("reportstatuses") List<String> reportstatuses);

    @Query("SELECT m FROM MasterTransaction m WHERE m.assignedBy.id = :userId ORDER BY m.createdDate DESC")
    List<MasterTransaction> findTasksAssignedByArchiver(@Param("userId") Long userId);

    @Query("SELECT m FROM MasterTransaction m " +
           "LEFT JOIN FETCH m.user " +
           "LEFT JOIN FETCH m.organization " +
           "LEFT JOIN FETCH m.user2 " +
           "LEFT JOIN FETCH m.transactiondocument " +
           "LEFT JOIN FETCH m.assignedBy " +
           "WHERE m.user2.id = :userId AND m.reportstatus IN ('Assigned', 'Rejected') ORDER BY m.createdDate DESC")
    List<MasterTransaction> findActiveSeniorAuditorTasks(@Param("userId") Long userId);

    @Query("SELECT m FROM MasterTransaction m " +
           "LEFT JOIN FETCH m.user " +
           "LEFT JOIN FETCH m.organization " +
           "LEFT JOIN FETCH m.user2 " +
           "LEFT JOIN FETCH m.transactiondocument " +
           "LEFT JOIN FETCH m.assignedBy " +
           "WHERE m.submittedByAuditor.id = :userId AND m.reportstatus = 'Approved' ORDER BY m.createdDate DESC")
    List<MasterTransaction> findApprovedSeniorAuditorTasks(@Param("userId") Long userId);

    @Query("SELECT m FROM MasterTransaction m " +
           "LEFT JOIN FETCH m.organization " +
           "LEFT JOIN FETCH m.transactiondocument " +
           "LEFT JOIN FETCH m.submittedByAuditor " +
           "LEFT JOIN FETCH m.budgetYear " +
           "WHERE m.reportstatus = 'Under Review' ORDER BY m.createdDate DESC")
    List<MasterTransaction> findUnderReviewReports();

    @Query("SELECT m FROM MasterTransaction m " +
           "LEFT JOIN FETCH m.organization " +
           "LEFT JOIN FETCH m.transactiondocument " +
           "LEFT JOIN FETCH m.budgetYear " +
           "LEFT JOIN FETCH m.submittedByAuditor " +
           "WHERE m.reportstatus = 'Corrected' ORDER BY m.createdDate DESC")
    List<MasterTransaction> findCorrectedReports();

    boolean existsByDocname(String docname);

    boolean existsByDocnameAndUserId(String docname, Long userId);

    boolean existsByDocnameAndUser(String docname, User user);

    @Query("SELECT t FROM MasterTransaction t WHERE t.reportstatus = :status AND t.user2.username = :username ORDER BY t.createdDate DESC")
    List<MasterTransaction> findByReportstatusAndUser2Username(String status, String username);

    @Query("SELECT m FROM MasterTransaction m WHERE m.reportstatus = :reportstatus ORDER BY m.createdDate DESC")
    List<MasterTransaction> findByReportstatus(@Param("reportstatus") String reportstatus);

    @Query("SELECT m FROM MasterTransaction m WHERE m.reportstatus = :reportstatus AND m.submittedByAuditor = :submittedByAuditor ORDER BY m.createdDate DESC")
    List<MasterTransaction> findByReportstatusAndSubmittedByAuditor(@Param("reportstatus") String reportstatus, @Param("submittedByAuditor") User submittedByAuditor);

    @Query("SELECT m FROM MasterTransaction m LEFT JOIN FETCH m.budgetYear WHERE m.id = :id")
    Optional<MasterTransaction> findByIdWithBudgetYear(@Param("id") Integer id);

    @Query("SELECT m FROM MasterTransaction m " +
           "LEFT JOIN FETCH m.organization " +
           "LEFT JOIN FETCH m.budgetYear " +
           "LEFT JOIN FETCH m.transactiondocument " +
           "WHERE m.user.id = :userId ORDER BY m.createdDate DESC")
    List<MasterTransaction> findByUserId(@Param("userId") Long userId);

    @Query("SELECT m FROM MasterTransaction m " +
           "LEFT JOIN FETCH m.user " +
           "LEFT JOIN FETCH m.organization " +
           "LEFT JOIN FETCH m.budgetYear " +
           "LEFT JOIN FETCH m.transactiondocument " +
           "LEFT JOIN FETCH m.submittedByAuditor " +
           "LEFT JOIN FETCH m.assignedBy " +
           "WHERE m.user.id = :userId ORDER BY m.createdDate DESC")
    List<MasterTransaction> findByUserIdWithLetters(@Param("userId") Long userId);

    @Query("SELECT DISTINCT o FROM Organization o WHERE o.id NOT IN " +
           "(SELECT m.organization.id FROM MasterTransaction m " +
           "WHERE m.reportcategory = 'Report' " +
           "AND m.transactiondocument.reportype = :reportype " +
           "AND m.budgetYear.fiscalYear = :fiscalYear " +
           "AND m.organization IS NOT NULL " +
           "AND m.transactiondocument IS NOT NULL " +
           "AND m.budgetYear IS NOT NULL)")
    List<Organization> findReportNonSendersByReportTypeAndBudgetYear(
            @Param("reportype") String reportype,
            @Param("fiscalYear") String fiscalYear);

    @Query("SELECT m FROM MasterTransaction m WHERE m.reportcategory = 'Report' " +
           "AND m.transactiondocument.reportype = :reportype " +
           "AND m.budgetYear.fiscalYear = :fiscalYear " +
           "AND m.organization.id = :orgId ORDER BY m.createdDate DESC")
    List<MasterTransaction> findReportsByOrgAndReportTypeAndBudgetYear(
            @Param("reportype") String reportype,
            @Param("fiscalYear") String fiscalYear,
            @Param("orgId") String orgId);

    @Query("SELECT DISTINCT m.organization FROM MasterTransaction m WHERE m.reportcategory = 'Report'")
    List<Organization> findAllOrganizationsWithReports();

    @Query("SELECT DISTINCT o FROM Organization o WHERE o.id NOT IN " +
           "(SELECT m.organization.id FROM MasterTransaction m " +
           "WHERE m.reportcategory = 'Feedback' " +
           "AND m.transactiondocument.reportype = :reportype " +
           "AND m.budgetYear.fiscalYear = :fiscalYear " +
           "AND m.organization IS NOT NULL " +
           "AND m.transactiondocument IS NOT NULL " +
           "AND m.budgetYear IS NOT NULL)")
    List<Organization> findFeedbackNonSendersByReportTypeAndBudgetYear(
            @Param("reportype") String reportype,
            @Param("fiscalYear") String fiscalYear);

    @Query("SELECT m FROM MasterTransaction m WHERE m.reportcategory = 'Feedback' " +
           "AND m.transactiondocument.reportype = :reportype " +
           "AND m.budgetYear.fiscalYear = :fiscalYear ORDER BY m.createdDate DESC")
    List<MasterTransaction> findFeedbackSendersByReportTypeAndBudgetYear(
            @Param("reportype") String reportype,
            @Param("fiscalYear") String fiscalYear);

    @Query("SELECT COUNT(DISTINCT m.organization) FROM MasterTransaction m WHERE m.reportcategory = 'Report' AND m.budgetYear.fiscalYear = :fiscalYear")
    long countSendersByFiscalYear(@Param("fiscalYear") String fiscalYear);

    @Query("SELECT COUNT(DISTINCT m.organization) FROM MasterTransaction m WHERE m.reportcategory = 'Report' AND m.transactiondocument.reportype = :reportype AND m.budgetYear.fiscalYear = :fiscalYear")
    long countSendersByReportTypeAndFiscalYear(@Param("reportype") String reportype, @Param("fiscalYear") String fiscalYear);

    @Query("SELECT m FROM MasterTransaction m " +
           "LEFT JOIN FETCH m.organization " +
           "LEFT JOIN FETCH m.budgetYear " +
           "LEFT JOIN FETCH m.transactiondocument " +
           "LEFT JOIN FETCH m.user " +
           "WHERE m.user.id = :userId ORDER BY m.createdDate DESC")
    List<MasterTransaction> findTransactionHistoryByUserId(@Param("userId") Long userId);

    @Query("SELECT m FROM MasterTransaction m " +
           "LEFT JOIN FETCH m.user " +
           "LEFT JOIN FETCH m.organization " +
           "WHERE m.organization.id = :orgId AND m.letterPath IS NOT NULL ORDER BY m.createdDate DESC")
    List<MasterTransaction> findTransactionsWithLettersByOrganization(@Param("orgId") String orgId);
}
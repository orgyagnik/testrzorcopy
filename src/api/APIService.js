import { Request as http } from "./http-common";
import { RequestWithLoader as httpWithLoader } from "./http-common";

const getLogin = (params) => {
  return httpWithLoader.post("/auth/login", params);
};

const forgotPassword = (params) => {
  return httpWithLoader.post("/auth/forgot-password", params);
};

const passwordReset = (params) => {
  return httpWithLoader.post("/auth/password-reset", params);
};

const passwordSet = (params) => {
  return httpWithLoader.post("/contact-set-password", params);
};

const getLogedInUser = (params, user_role) => {
  if (user_role === "client") {
    return http.get("/client/profile", params);
  }
  else {
    return http.get("/auth/profile", params);
  }
};

const updateUserProfile = (params, user_role) => {
  if (user_role === "client") {
    return httpWithLoader.post("/update/client-profile", params);
  }
  else {
    return httpWithLoader.patch(`/users/profile`, params);
  }
};

const profilePhotosUpdate = (params, user_role) => {
  if (user_role === "client") {
    return httpWithLoader.post("/update/client-profile-image", params);
  }
  else {
    return httpWithLoader.post("/update/staff-profile-image", params);
  }
};

const profilePhotosDelete = (params, user_role) => {
  if (user_role === "client") {
    return httpWithLoader.post("/delete/client-profile-image", params);
  }
  else {
    return httpWithLoader.post("/delete/staff-profile-image", params);
  }
};

const changePassword = (id, params) => {
  return httpWithLoader.patch(`/users/${id}`, params);
};

const staffChangePassword = (id, params) => {
  return httpWithLoader.patch(`/users/${id}`, params);
};

const addUser = (params) => {
  return httpWithLoader.post("/users", params);
};

const editUser = (id, params) => {
  return httpWithLoader.patch(`/users/${id}`, params);
};

const logoutApi = () => {
  return http.post("/auth/logout");
};

const getRoleList = () => {
  return http.get("/roles");
};

const getRoleForEdit = (params) => {
  return httpWithLoader.get("/view/role/" + params);
};

const getProjectForEdit = (params) => {
  return httpWithLoader.get("/projects/" + params);
};

const getCountry = () => {
  return http.post("/list/countries");
};

const getState = (params) => {
  return http.post("/list/state/" + params);
};

const addRole = (params) => {
  return httpWithLoader.post("/add/role", params);
};

const editRole = (params) => {
  return httpWithLoader.post("/update/role", params);
};

const getAgencyList = (params) => {
  return httpWithLoader.get("/users/agency-members" + params);
};

const getStaffList = (params) => {
  return httpWithLoader.get("/users/staff-members" + params);
};

const getStaffForEdit = (params) => {
  return httpWithLoader.get("/users/" + params);
};

const getPermissionList = () => {
  return httpWithLoader.get("/list/permission");
};

const getAllMembers = (params = '') => {
  // Ensure params is a string and prepend with '?' if not empty
  const queryString = params ? `?${params}` : '';
  return http.get(`/users/list-managers${queryString}`);
};

const getAllProjectMembers = (params) => {
  return http.get("/get-project-members/" + params);
};

const getAllTeamMembers = () => {
  return http.get("/get-all-team-members");
};

const getAllProjects = (params = '') => {
  // Ensure params is a string and prepend with '?' if not empty
  const queryString = params ? `?${params}` : '';
  return http.get(`/projects${queryString}`);
};

const getAllAgency = (params) => {
  if(params)
    return http.get("/users/list-agencies" + params);
  else
    return http.get("/users/list-agencies");
};

const getAllClients = () => {
  return http.get("/get-all-clients");
};

const enableDisableStaff = (params) => {
  return httpWithLoader.post("/enable-disable/staff", params);
};

const addTask = (params) => {
  return httpWithLoader.post("/article", params);
};

const staffAddPermission = (params) => {
  return httpWithLoader.post("/add/permission", params);
};

/*const generateToken = () => {
  return new_http.post("/generate-token");
};*/

const getTaskList = (params) => {
  return httpWithLoader.get("/list/task" + params);
};

const getTaskListByStatus = (params) => {
  return httpWithLoader.get("/task-list-by-status" + params);
};

const getProjectList = (params) => {
  return httpWithLoader.get("/projects" + params);
};

const addProject = (params) => {
  return httpWithLoader.post("/projects", params);
};

const updateProject = (id, params) => {
  return http.patch("/projects/" + id, params);
};
const setTaskListPriority = (params) => {
  return http.post("/update/task-priority", params);
};

const deleteProject = (id, params) => {
  return httpWithLoader.delete(`/projects/${id}`);
};

const deleteTask = (params) => {
  return httpWithLoader.post("/delete/task", params);
};

const getTaskById = (params) => {
  return httpWithLoader.get("/view/task/" + params);
};

const removeAttachment = (params) => {
  return httpWithLoader.post("/remove/attachment", params);
};

const updateTask = (params) => {
  return httpWithLoader.post("/update/task", params);
};

const updateTaskStatus = (params) => {
  return httpWithLoader.post("/update/task-status", params);
};

const addTaskComment = (params) => {
  return httpWithLoader.post("/add/comment", params);
};

const EditTaskComment = (params) => {
  return httpWithLoader.post("/update/comment", params);
};

const deleteTaskComment = (params) => {
  return httpWithLoader.post("/delete/comment", params);
};

const getTaskStatus = () => {
  return http.get("/task-status");
};

const getTicketStatus = () => {
  return http.get("/get-all-ticket-status");
};

const getProjectStatus = () => {
  return http.get("/get-all-project-status");
};

const getTaskListForCalendar = (params) => {
  return httpWithLoader.get("/task/calendar" + params);
};

const twoFactorAuthentication = (id, params) => {
  return httpWithLoader.patch(`/users/${id}`, params);
};

const addRemoveFavorite = (params) => {
  return httpWithLoader.post("/favorite-unfavorite-task", params);
};

const getFavavoriteTasks = () => {
  return http.get("/get-favorite-tasks");
};

const getStripePlans = (params) => {
  return httpWithLoader.post("/stripe-list/plans", params);
};

const getStripeBucketPlans = (params) => {
  return httpWithLoader.post("/price-list/bucket-plans", params);
};

const verifyCoupon = (params) => {
  return httpWithLoader.post("/verify-coupon", params);
};

const Register = (params) => {
  return httpWithLoader.post("/register", params);
};

const bucketPlanRegister = (params) => {
  return httpWithLoader.post("/register-bucket-plan", params);
};

const verification = (code) => {
  return httpWithLoader.get("/verification/" + code);
};

const getSubscriptionDetails = () => {
  return httpWithLoader.get("/manage/subscription");
};

const getUpcomingInvoiceDetails = () => {
  return httpWithLoader.get("/manage/upcoming-invoices");
};

const getPastInvoiceList = () => {
  return httpWithLoader.get("/manage/past-invoices");
};

const getDevPlan = () => {
  return httpWithLoader.get("/manage/dev-plan");
};

const getDevPlanPrice = (params) => {
  return httpWithLoader.post("/manage/dev-preview", params);
};

const upgradeDowngradePlan = (params) => {
  return httpWithLoader.post("/manage/update-dev-plan", params);
};

const cancelSubscriptionPlan = (params) => {
  return httpWithLoader.post("/manage/cancel-subscription", params);
};

const dontCancelSubscriptionPlan = (params) => {
  return httpWithLoader.post("/manage/dont-cancel-subscription", params);
};

const getSaveCards = () => {
  return httpWithLoader.get("/manage/get-save-card");
};

const setCardAsDefault = (params) => {
  return httpWithLoader.post("/manage/save-as-default", params);
};

const addCard = (params) => {
  return httpWithLoader.post("/manage/add-card", params);
};

const deleteCard = (params) => {
  return httpWithLoader.post("/manage/delete-card", params);
};

const getSiteAddOns = () => {
  return httpWithLoader.get("/manage/get-site-addons");
};

const getSiteAddOnsList = (params) => {
  return httpWithLoader.post("/manage/site-addons-list", params);
};

const updateSiteAddOnsTotal = (params) => {
  return httpWithLoader.post("/manage/add-site-addons-calculation", params);
};

const addSiteAddons = (params) => {
  return httpWithLoader.post("/manage/add-site-addons", params);
};

const updateSiteAddons = (params) => {
  return httpWithLoader.post("/manage/update-site-addons", params);
};

const removeSiteAddons = (params) => {
  return httpWithLoader.post("/manage/remove-site-addons", params);
};

const addSiteURL = (params) => {
  return httpWithLoader.post("/manage/add-site-url", params);
};

const updateSiteAddOnsTotalForUpdate = (params) => {
  return httpWithLoader.post("/manage/update-site-addons-total", params);
};

const getLeaveLists = (params) => {
  return httpWithLoader.get("/list/leave" + params);
}

const getTodayApprovedLeaveLists = (params) => {
  return httpWithLoader.get("/list/today-approved-leave" + params);
}

const getLeaveBucketLists = (params) => {
  return httpWithLoader.get("/list/allowed-leave" + params);
}

const getLeaveTypes = (params) => {
  return httpWithLoader.get("/leave-types");
}

const addLeave = (params) => {
  return httpWithLoader.post("/add/leave", params);
};

const addAllowedLeave = (params) => {
  return httpWithLoader.post("/add/allowed-leave", params);
};

const updateLeave = (params) => {
  return httpWithLoader.post("/update/leave", params);
};

const updateLeaveAllowed = (params) => {
  return httpWithLoader.post("/update/allowed-leave", params);
};

const deleteLeave = (params) => {
  return httpWithLoader.post("/remove/leave", params);
};

const getSubscriptionList = (params) => {
  return httpWithLoader.get("/all-subscription-list" + params);
}

const getSubscriptionInvoiceList = (params) => {
  return httpWithLoader.post("/customer_invoices", params);
}

const getAgencySitesList = (params) => {
  return httpWithLoader.get("/all-sites-list" + params);
}

const getAgencySitesListForAll = (params) => {
  return http.get("/addon-all-sites-list" + params);
}

const addRatingReview = (params) => {
  return httpWithLoader.post("/add/rating", params);
}

const getRatingReviewsList = (params) => {
  return httpWithLoader.get("/list/rating" + params);
}

const updateRegisterSiteAddOnsTotal = (params) => {
  return httpWithLoader.post("/calculate-register-site-addons", params);
};

const registerSiteAddons = (params) => {
  return httpWithLoader.post("/register-site-addons", params);
};

const getDesignationList = () => {
  return http.get("/designations");
};

const getTaskBoardList = (params) => {
  return httpWithLoader.get("/list/task-board" + params);
};

const getQABoardList = (params) => {
  return httpWithLoader.get("/list/qa-board" + params);
};

const getTaskForQA = (params) => {
  return http.get("/qa-task-list" + params);
};

const removeTaskboard = (params) => {
  return httpWithLoader.post("/remove/task-board", params);
};

const removeQATaskboard = (params) => {
  return httpWithLoader.post("/remove/qa-board", params);
};

const testedQATaskboard = (params) => {
  return httpWithLoader.post("/tested/qa-board", params);
};

const getAllAgencyWithPlan = () => {
  return http.get("/get-all-agency-with-plan");
};

const addTaskboardCard = (params) => {
  return httpWithLoader.post("/assign/task-board", params);
};

const addQAboardCard = (params) => {
  return httpWithLoader.post("/assign/qa-board", params);
};

const updateTaskboardCard = (params) => {
  return httpWithLoader.post("/update/task-board", params);
};

const updateQATaskboardCard = (params) => {
  return httpWithLoader.post("/update/qa-board", params);
};

const getManageEmploye = () => {
  return http.get("/list/trello_developers");
};

const getManageQAEmploye = () => {
  return http.get("/list/qa_developers");
};

const setStaffListPriority = (params) => {
  return httpWithLoader.post("/update/trello-priority", params);
};

const setQAListPriority = (params) => {
  return httpWithLoader.post("/update/qa-trello-priority", params);
};

const getTaskComment = (params) => {
  return http.get("/list/comment" + params);
};

const doneTaskboard = (params) => {
  return httpWithLoader.post("/done/task-board", params);
};

const doneQATaskboard = (params) => {
  return httpWithLoader.post("/done/qa-board", params);
};

const getCustomerLists = (params) => {
  return httpWithLoader.get("/list/customers" + params);
}

const getContactLists = (params) => {
  return httpWithLoader.get("/list/contacts" + params);
}

const updateCustomerActiveDeactive = (params) => {
  return httpWithLoader.post("/active-deactive", params);
};

const taskBulkAction = (params) => {
  return httpWithLoader.post("/task-bulk-action-new", params);
};

const getNotification = (params) => {
  return http.get("/list/notification" + params);
};

const getNotificationWithLoader = (params) => {
  return httpWithLoader.get("/list/notification" + params);
};

const markAllAsReadProcess = (params) => {
  return http.post("/mark-as-read", params);
};

const updateLeaveStatus = (params) => {
  return httpWithLoader.post("/update/leave-status", params);
};

const migrateAgencyName = (params) => {
  return http.post("/migrate-agency-name", params);
};

const addClient = (params) => {
  return httpWithLoader.post("/add/client", params);
};

const getClientForEdit = (params) => {
  return httpWithLoader.get("/view/client/" + params);
};

const deleteClient = (params) => {
  return httpWithLoader.post("/delete/client", params);
};

const updateClient = (params) => {
  return httpWithLoader.post("/update/client", params);
};

const addContact = (params) => {
  return httpWithLoader.post("/add/contact", params);
};

const updateContact = (params) => {
  return httpWithLoader.post("/update/contact", params);
};

const deleteContact = (params) => {
  return httpWithLoader.post("/delete/contact", params);
};

const updateAssignMembers = (params) => {
  return http.post("/task/assign-members", params);
};

const updateFollowers = (params) => {
  return http.post("/task/add-follower-members", params);
};

const agencyDashboard = (params) => {
  return httpWithLoader.post("/agency-dashboard", params);
};


const getArticleList = (params = '') => {
  // Ensure params is a string and prepend with '?' if not empty
  const queryString = params ? `${params}` : '';
  return http.get(`/article${queryString}`);
};
const getTaskSummary = (params) => {
  return http.get("/article/task-status-count" + params);
};

const deleteProjectMember = (params) => {
  return http.post("/projects/project-member-delete", params);
};

const addProjectMember = (params) => {
  return http.post("/projects/project-member-add", params);
};

const userBulkAction = (params) => {
  return httpWithLoader.post("/staff-bulk-action", params);
};

const getLeaveCalendar = (params) => {
  return http.get("/leave/calendar" + params);
};

const dashboardHoursStats = (params) => {
  return http.get("/dashboard/hours-stats" + params);
};

const getHourlyStatsReport = (params) => {
  return http.get("/hourly-report" + params);
};

const getTaskboardHourlyReport = (params) => {
  return httpWithLoader.get("/taskboard-hours-report" + params);
};

const getCustomerAdmins = (params) => {
  return http.get("/list/customer-admins" + params);
};

const deleteCustomerAdmins = (params) => {
  return httpWithLoader.post("/delete/customer-admins", params);
};

const addCustomerAdmins = (params) => {
  return httpWithLoader.post("/add/customer-admins", params);
};

const getDashboardLeaveLists = (params) => {
  return http.get("/dashboard/leave-list" + params);
};

const gloablSearch = (params) => {
  return http.get("/global-search" + params);
};

const sendTestNotification = (params) => {
  return http.post("/test-notification", params);
};

const getProjectLogList = (params) => {
  return httpWithLoader.get("/logs/project-log-list" + params);
};

const getActivityLogList = (params) => {
  return httpWithLoader.get("/logs/activity-log-list" + params);
};

const getAffiliateData = (params) => {
  return http.get("/affiliate-data" + params);
};

const getStaffRatingReport = (params) => {
  return httpWithLoader.get("/list/task-board-rating" + params);
}

const getStaffQARatingReport = (params) => {
  return httpWithLoader.get("/list/qa-board-rating" + params);
}

const getTaskUnattended = (params) => {
  return httpWithLoader.get("/list/task-unattended" + params);
}

const getDesignationListForAdmin = (params) => {
  return httpWithLoader.get("/list/designation" + params);
}

const addDesignation = (params) => {
  return httpWithLoader.post("/add/designation", params);
};

const updateDesignation = (params) => {
  return httpWithLoader.post("/update/designation", params);
};

const deleteDesignation = (params) => {
  return httpWithLoader.post("/delete/designation", params);
};

const getMeetingList = (params) => {
  return httpWithLoader.get("/list/meeting-notes" + params);
};

const addMeetingNote = (params) => {
  return httpWithLoader.post("/add/meeting-notes", params);
};

const updateMeetingNote = (params) => {
  return httpWithLoader.post("/update/meeting-notes", params);
};

const deleteMeetingNote = (params) => {
  return httpWithLoader.post("/delete/meeting-notes", params);
};

const getAllPlan = () => {
  return http.get("/all-plan-list");
};

const autoLogin = (params) => {
  return httpWithLoader.post("/auth/auto-login", params);
};

const getTaskCheckList = (params) => {
  return http.get("/list/checklist" + params);
};

const updateChecklist = (params) => {
  return http.post("/update/checklist", params);
};

const updateChecklistPriority = (params) => {
  return http.post("/update/checklist-priority", params);
};

const addChecklist = (params) => {
  return http.post("/add/checklist", params);
};

const deleteTaskCheckList = (params) => {
  return http.post("/remove/checklist", params);
};

const downloadAttachmentsZip = (params) => {
  return httpWithLoader.get("/download-all-attachments" + params);
};

const updateProjectStatus = (params) => {
  return httpWithLoader.post("/update/project-status", params);
};

const getTaskTotalHours = (params) => {
  return http.get("/total_task_comment_billable_hours/" + params);
};

const getTestEmailTemplate = (params) => {
  return http.get("/email-templates" + params);
};

const saveTestEmailTemplate = (params) => {
  return httpWithLoader.post("/update/email-templates", params);
};

const projectBulkAction = (params) => {
  return httpWithLoader.post("/projects/project-bulk-assign", params);
};

const getBucketPlanList = (params) => {
  return httpWithLoader.get("/list/bucket-plans" + params);
};

const upgradeDowngradeBucketPlan = (params) => {
  return httpWithLoader.post("/add/bucket-plans", params);
};

const getBucketTrackingReport = (params) => {
  return httpWithLoader.get("/list/bucket-tracking-report" + params);
};

const getBucketTrackingReportByTask = (params) => {
  return httpWithLoader.get("/list/bucket-tracking-report-bytask" + params);
};

const getTicketSystemList = (params) => {
  return httpWithLoader.get("/list/ticket-system" + params);
}

const updateTicketStatus = (params) => {
  return httpWithLoader.post("/update/ticket-status", params);
};

const addTicketSystem = (params) => {
  return httpWithLoader.post("/add/ticket-system", params);
};

const updateTicketSystem = (params) => {
  return httpWithLoader.post("/update/ticket-system", params);
};

const deleteTicketSystem = (params) => {
  return httpWithLoader.post("/delete/ticket-system", params);
};

const setTicketSystemListPriority = (params) => {
  return http.post("/update/ticket-priority", params);
};

const getTicketForEdit = (params) => {
  return httpWithLoader.get("/view/ticket-system/" + params);
};

const getTicketCategory = () => {
  return http.get("/get-all-ticket-categories");
};

const getTicketComment = (params) => {
  return http.get("/list/ticket-system-comment" + params);
};

const deleteTicketComment = (params) => {
  return httpWithLoader.post("/delete/ticket-system-comment", params);
};

const addTicketComment = (params) => {
  return httpWithLoader.post("/add/ticket-system-comment", params);
};

const updateTicketComment = (params) => {
  return httpWithLoader.post("/update/ticket-system-comment", params);
};

const getWorkReportStatus = () => {
  return http.get("/get-all-work-report-status");
};

const getAllTask = (params) => {
  return http.get("/list/work-report-task" + params);
};

const addWorkReport = (params) => {
  return httpWithLoader.post("/add/work-report", params);
};

const getWorkReportList = (params) => {
  return httpWithLoader.get("/list/work-report" + params);
}

const getWorkReportNotSendList = (params) => {
  return httpWithLoader.get("/list/work-report-not-send" + params);
}

const viewWorkReportById = (params) => {
  return httpWithLoader.get("/view/work-report/" + params);
};

const viewWorkReportByIdForEdit = (params) => {
  return httpWithLoader.get("/edit/work-report/" + params);
};

const deleteWorkReport = (params) => {
  return httpWithLoader.post("/delete/work-report", params);
};

const updateWorkReport = (params) => {
  return httpWithLoader.post("/update/work-report", params);
};

const getDevTrackingReport = (params) => {
  return httpWithLoader.get("/list/dev-tracking-report" + params);
};

const getDevTrackingReportByTask = (params) => {
  return httpWithLoader.get("/list/dev-tracking-report-bytask" + params);
};

const getPersonalizeDevAddonPlan = (params) => {
  return http.post("/price-list/dev-addon", params);
};

const addDevAddonPlan = (params) => {
  return httpWithLoader.post("/add/dev-addon", params);
};

const cancelPersonalizeDevAddon = (params) => {
  return httpWithLoader.post("/delete/dev-addon", params);
};

const getEmailTemplateList = () => {
  return httpWithLoader.get("/list/email-templates");
};

const getCustomTaskBoardList = (params) => {
  return httpWithLoader.get("/list/custom-task-board" + params);
};

const getCustomDeveloperList = () => {
  return http.get("/list/custom_developers");
};

const addCustomTaskboardCard = (params) => {
  return httpWithLoader.post("/assign/custom-task-board", params);
};

const updateCustomTaskboardCard = (params) => {
  return httpWithLoader.post("/update/custom-task-board", params);
};

const doneCustomTaskboard = (params) => {
  return httpWithLoader.post("/done/custom-task-board", params);
};

const removeCustomTaskboard = (params) => {
  return httpWithLoader.post("/remove/custom-task-board", params);
};

const getTimezoneList = () => {
  return http.get("/global/timezones");
};

const setCustomStaffListPriority = (params) => {
  return httpWithLoader.post("/update/custom-trello-priority", params);
};

const getEmailTemplateForEdit = (params) => {
  return httpWithLoader.get("/view/email-templates/" + params);
};

const updateEmailTemplate = (params) => {
  return httpWithLoader.post("/update/email-templates", params);
};

const downloadReceipt = (params) => {
  return httpWithLoader.get("/download-receipt" + params);
};

const enableDisableEmailTemplate = (params) => {
  return httpWithLoader.post("/enable-disable/email-templates", params);
};

const getNoticeList = (params) => {
  return httpWithLoader.get("/list/notice" + params);
}

const addNotice = (params) => {
  return httpWithLoader.post("/add/notice", params);
};

const getNoticeForEdit = (params) => {
  return httpWithLoader.get("/view/notice/" + params);
};

const updateNotice = (params) => {
  return httpWithLoader.post("/update/notice", params);
};

const deleteNotice = (params) => {
  return httpWithLoader.post("/delete/notice", params);
};

const getTodayNotice = (params) => {
  return http.get("/get-today-notice" + params);
};

const getTaskboardStaffHourlyReport = (params) => {
  return httpWithLoader.get("/taskboard-staff-hours-report" + params);
};

const getThresholdLeaveList = (params) => {
  return httpWithLoader.get("/list/threshold-leave" + params);
}

const getThresholdLeaveForEdit = (params) => {
  return httpWithLoader.get("/view/threshold-leave/" + params);
}

const updateThresholdLeave = (params) => {
  return httpWithLoader.post("/update/threshold-leave", params);
};

const deleteThresholdLeave = (params) => {
  return httpWithLoader.post("/delete/threshold-leave", params);
};

const addThresholdLeave = (params) => {
  return httpWithLoader.post("/add/threshold-leave", params);
};

const getRemainingLeaveList = (params) => {
  return httpWithLoader.get("/list/remaining-leave" + params);
}

const getManageResourceEmployee = () => {
  return http.get("/list/resource-allocation-developers");
};

const getResourceAllocationList = (params) => {
  return httpWithLoader.get("/list/resource-allocation" + params);
};

const addResourceAllocationCard = (params) => {
  return httpWithLoader.post("/assign/resource-allocation", params);
};

const updateResourceAllocationCard = (params) => {
  return httpWithLoader.post("/update/resource-allocation", params);
};

const setResourceAllocationPriority = (params) => {
  return httpWithLoader.post("/update/resource-allocation-priority", params);
};

const removeResourceAllocation = (params) => {
  return httpWithLoader.post("/remove/resource-allocation", params);
};

const doneResourceAllocation = (params) => {
  return httpWithLoader.post("/done/resource-allocation", params);
};

const getAllAgencyWithPlanForResourceAllocation = (params) => {
  return http.get("/get-agency-plan-for-resource-allocation" + params);
};

const getBucketPlanExpireList = () => {
  return http.get("/list/bucket-plan-expire");
};
const getDelayTaskReportList = (params) => {
  return httpWithLoader.get("/delay-task-report" + params);
}

const clearTaskViewCache = (params) => {
  return httpWithLoader.post("/view/task-clear-cache" , params);
};

const getDashboardLeaveListTableView = (params) => {
  return http.get("/dashboard/leave-list-calendar-view" + params);
}

const addRemoteWorkRequest = (params) => {
  return httpWithLoader.post("/add/remote-work-request", params);
};

const getRemoteWorkList = (params) => {
  return httpWithLoader.get("/list/remote-work-request" + params);
}

const updateRemoteWork = (params) => {
  return httpWithLoader.post("/update/remote-work-request", params);
};

const deleteRemoteWork = (params) => {
  return httpWithLoader.post("/delete/remote-work-request", params);
};

const updateRemoteWorkStatus = (params) => {
  return httpWithLoader.post("/update/remote-work-request-status", params);
}
const allClearCache = (params) => {
  return httpWithLoader.post("/all-clear-cache" , params);
};

const getRemoteWork = (params) => {
  return httpWithLoader.get("/view/remote-work-request/" + params);
};

const addRemoteWorkComment = (params) => {
  return httpWithLoader.post("/add/remote-work-comment", params);
};

const getRemoteWorkComment = (params) => {
  return http.get("/list/remote-work-comment" + params);
};

const deleteRemoteWorkComment = (params) => {
  return httpWithLoader.post("/delete/remote-work-comment", params);
};

const updateRemoteWorkComment = (params) => {
  return httpWithLoader.post("/update/remote-work-comment", params);
};

const getResourceAllocationForEdit = (params) => {
  return httpWithLoader.get("/view/resource-allocation/" + params);
};


const getTaskBoardForEdit = (params) => {
  return httpWithLoader.get("/view/task-board/" + params);
};

const getAiTaskBoardList = (params) => {
  return httpWithLoader.get("/list/ai-task-board" + params);
};

const getAiDeveloperList = () => {
  return http.get("/list/ai-developers");
};

const addAiTaskboardCard = (params) => {
  return httpWithLoader.post("/assign/ai-task-board", params);
};

const updateAiTaskboardCard = (params) => {
  return httpWithLoader.post("/update/ai-task-board", params);
};

const doneAiTaskboard = (params) => {
  return httpWithLoader.post("/done/ai-task-board", params);
};

const removeAiTaskboard = (params) => {
  return httpWithLoader.post("/remove/ai-task-board", params);
};

const setAiStaffListPriority = (params) => {
  return httpWithLoader.post("/update/ai-trello-priority", params);
};

const getRemoteWorkStatus = () => {
  return http.get("/get-all-remote-work-status");
};

const getDevTrackingReportByProject = (params) => {
  return httpWithLoader.get("/list/dev-tracking-report-byproject" + params);
};

const getEditorAddAndUpdateImageUrl = (params) => {
  return httpWithLoader.post("/add-update/editor-image", params);
};

const fetchKeywordMetrics = (params) => {
  return httpWithLoader.post("/projects/fetch-keyword-metrics",  params);
};
const getRecommendedKeywords  = (params) => {
  return httpWithLoader.post("/projects/fetch-keyword-recommendation",  params);
};
const generateTitles = (params) => {
  return httpWithLoader.post("/openai/generate-titles", params);
};
const auth = (params) => {
  return httpWithLoader.post("/auth", params);
};
const updateGoogleDocContent = (params) => {
  return httpWithLoader.post("/update-google-doc", params);
};
const APIService = {
  getLogin,
  getLogedInUser,
  logoutApi,
  updateUserProfile,
  profilePhotosUpdate,
  profilePhotosDelete,
  getCountry,
  getState,
  changePassword,
  addUser,
  editUser,
  getRoleList,
  getRoleForEdit,
  addRole,
  editRole,
  getAgencyList,
  getStaffList,
  getStaffForEdit,
  getPermissionList,
  getAllMembers,
  getAllProjectMembers,
  getAllTeamMembers,
  getAllProjects,
  getAllClients,
  enableDisableStaff,
  addTask,
  //generateToken,
  staffAddPermission,
  staffChangePassword,
  getTaskListByStatus,
  getTaskList,
  getProjectList,
  getAllAgency,
  setTaskListPriority,
  getProjectForEdit,
  addProject,
  updateProject,
  deleteProject,
  getTaskById,
  deleteTask,
  removeAttachment,
  updateTask,
  updateTaskStatus,
  addTaskComment,
  EditTaskComment,
  deleteTaskComment,
  getTaskStatus,
  getTicketStatus,
  getProjectStatus,
  forgotPassword,
  passwordReset,
  passwordSet,
  getTaskListForCalendar,
  twoFactorAuthentication,
  addRemoveFavorite,
  getFavavoriteTasks,
  getStripePlans,
  getStripeBucketPlans,
  verifyCoupon,
  Register,
  bucketPlanRegister,
  verification,
  getSubscriptionDetails,
  getUpcomingInvoiceDetails,
  getPastInvoiceList,
  getDevPlan,
  getDevPlanPrice,
  upgradeDowngradePlan,
  cancelSubscriptionPlan,
  dontCancelSubscriptionPlan,
  getSaveCards,
  setCardAsDefault,
  addCard,
  deleteCard,
  getSiteAddOns,
  getSiteAddOnsList,
  updateSiteAddOnsTotal,
  addSiteAddons,
  updateSiteAddons,
  removeSiteAddons,
  addSiteURL,
  updateSiteAddOnsTotalForUpdate,
  getLeaveLists,
  getTodayApprovedLeaveLists,
  getLeaveBucketLists,
  getLeaveTypes,
  addLeave,
  addAllowedLeave,
  updateLeave,
  updateLeaveAllowed,
  deleteLeave,
  getSubscriptionList,
  getSubscriptionInvoiceList,
  getAgencySitesList,
  getAgencySitesListForAll,
  addRatingReview,
  getRatingReviewsList,
  updateRegisterSiteAddOnsTotal,
  registerSiteAddons,
  getDesignationList,
  getTaskBoardList,
  getQABoardList,
  getTaskForQA,
  removeTaskboard,
  removeQATaskboard,
  testedQATaskboard,
  getAllAgencyWithPlan,
  addTaskboardCard,
  addQAboardCard,
  updateTaskboardCard,
  updateQATaskboardCard,
  getManageEmploye,
  getManageQAEmploye,
  setStaffListPriority,
  setQAListPriority,
  getTaskComment,
  doneTaskboard,
  doneQATaskboard,
  getCustomerLists,
  getContactLists,
  updateCustomerActiveDeactive,
  taskBulkAction,
  getNotification,
  getNotificationWithLoader,
  markAllAsReadProcess,
  updateLeaveStatus,
  migrateAgencyName,
  addClient,
  getClientForEdit,
  deleteClient,
  updateClient,
  addContact,
  updateContact,
  deleteContact,
  updateAssignMembers,
  updateFollowers,
  agencyDashboard,
  getTaskSummary,
  deleteProjectMember,
  addProjectMember,
  userBulkAction,
  getLeaveCalendar,
  dashboardHoursStats,
  getHourlyStatsReport,
  getCustomerAdmins,
  deleteCustomerAdmins,
  addCustomerAdmins,
  getDashboardLeaveLists,
  gloablSearch,
  sendTestNotification,
  getProjectLogList,
  getActivityLogList,
  getAffiliateData,
  getStaffRatingReport,
  getStaffQARatingReport,
  getTaskUnattended,
  getDesignationListForAdmin,
  addDesignation,
  updateDesignation,
  deleteDesignation,
  getMeetingList,
  addMeetingNote,
  updateMeetingNote,
  deleteMeetingNote,
  getAllPlan,
  getTaskboardHourlyReport,
  autoLogin,
  getTaskCheckList,
  updateChecklist,
  updateChecklistPriority,
  addChecklist,
  deleteTaskCheckList,
  downloadAttachmentsZip,
  updateProjectStatus,
  getTaskTotalHours,
  getTestEmailTemplate,
  saveTestEmailTemplate,
  projectBulkAction,
  getBucketPlanList,
  upgradeDowngradeBucketPlan,
  getBucketTrackingReport,
  getBucketTrackingReportByTask,
  getTicketSystemList,
  updateTicketStatus,
  addTicketSystem,
  updateTicketSystem,
  deleteTicketSystem,
  setTicketSystemListPriority,
  getTicketForEdit,
  getTicketCategory,
  getTicketComment,
  deleteTicketComment,
  addTicketComment,
  updateTicketComment,
  getWorkReportStatus,
  getAllTask,
  addWorkReport,
  getWorkReportList,
  getWorkReportNotSendList,
  viewWorkReportById,
  viewWorkReportByIdForEdit,
  deleteWorkReport,
  updateWorkReport,
  getDevTrackingReport,
  getDevTrackingReportByTask,
  getPersonalizeDevAddonPlan,
  addDevAddonPlan,
  cancelPersonalizeDevAddon,
  getEmailTemplateList,
  getCustomTaskBoardList,
  getCustomDeveloperList,
  addCustomTaskboardCard,
  updateCustomTaskboardCard,
  doneCustomTaskboard,
  removeCustomTaskboard,
  getTimezoneList,
  setCustomStaffListPriority,
  getEmailTemplateForEdit,
  updateEmailTemplate,
  downloadReceipt,
  enableDisableEmailTemplate,
  getNoticeList,
  addNotice,
  getNoticeForEdit,
  updateNotice,
  deleteNotice,
  getTodayNotice,
  getTaskboardStaffHourlyReport,
  getThresholdLeaveList,
  getThresholdLeaveForEdit,
  updateThresholdLeave,
  deleteThresholdLeave,
  addThresholdLeave,
  getRemainingLeaveList,
  getManageResourceEmployee,
  getResourceAllocationList,
  addResourceAllocationCard,
  updateResourceAllocationCard,
  setResourceAllocationPriority,
  removeResourceAllocation,
  doneResourceAllocation,
  getAllAgencyWithPlanForResourceAllocation,
  getBucketPlanExpireList,
  getDelayTaskReportList,
  clearTaskViewCache,
  getDashboardLeaveListTableView,
  allClearCache,
  addRemoteWorkRequest,
  getRemoteWorkList,
  updateRemoteWork,
  deleteRemoteWork,
  updateRemoteWorkStatus,
  getRemoteWork,
  addRemoteWorkComment,
  getRemoteWorkComment,
  deleteRemoteWorkComment,
  updateRemoteWorkComment,
  getResourceAllocationForEdit,
  getTaskBoardForEdit,
  getAiTaskBoardList,
  getAiDeveloperList,
  addAiTaskboardCard,
  updateAiTaskboardCard,
  doneAiTaskboard,
  removeAiTaskboard,
  setAiStaffListPriority,
  getRemoteWorkStatus,
  getDevTrackingReportByProject,
  getEditorAddAndUpdateImageUrl,
  generateTitles,
  auth,
  fetchKeywordMetrics,
  getRecommendedKeywords,
  updateGoogleDocContent,
  getArticleList
};

export default APIService;

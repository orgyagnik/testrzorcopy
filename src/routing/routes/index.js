import Dashboard from '../../pages/Dashboards';
import Mytask from '../../pages/task/Mytask';
import KanbanTasks from '../../pages/task/KanbanTasks';
import SetTaskPriority from '../../pages/task/SetTaskPriority';
import Users from '../../pages/user/Users';
import AgencyUsers from '../../pages/user/AgencyUsers';
//import Settings from "../../pages/user/Settings";
import Profile from "../../pages/user/Profile";
import AddUser from '../../pages/user/AddUser';
import AddRole from '../../pages/role-permission/AddRole';
import RoleList from '../../pages/role-permission/RoleList';
import EditRole from '../../pages/role-permission/EditRole';
import EditUser from '../../pages/user/EditUser';
import ProjectList from '../../pages/project/ProjectList';
import EditProject from '../../pages/project/EditProject';
import AddProject from '../../pages/project/AddProject';
import Subscriptions from '../../pages/subscription/Subscriptions';
import ManageDevPlans from '../../pages/subscription/ManageDevPlans';
import ManageSiteAddOns from '../../pages/subscription/ManageSiteAddOns';
import ManageBucketPlans from '../../pages/subscription/ManageBucketPlans';
import UpcomingInvoice from '../../pages/subscription/UpcomingInvoice';
import PastInvoice from '../../pages/subscription/PastInvoice';
import UpdateCard from '../../pages/subscription/UpdateCard';
import Taskboard from "../../pages/task-board/Taskboard";
import CustomTaskboard from "../../pages/task-board/CustomTaskboard";
import QABoard from "../../pages/task-board/QABoard";
import Leaves from "../../pages/leave/Leaves";
import TodayLeaves from "../../pages/leave/TodayLeaves";
import LeaveBucket from "../../pages/leave/LeaveBucket";
import SubscriptionsList from '../../pages/subscription/SubscriptionsList';
import SubscriptionsInvoiceList from '../../pages/subscription/SubscriptionsInvoiceList';
import AgencySites from '../../pages/sites/AgencySites';
import RatingReviews from '../../pages/rating-reviews/RatingReviews';
import Customers from "../../pages/customer/Customers";
import Contacts from "../../pages/customer/Contacts";
import CustomersProfile from "../../pages/customer/CustomersProfile";
import CustomersContacts from "../../pages/customer/CustomersContacts";
import NotificationList from "../../pages/Notification/NotificationList";
import ProjectDetail from "../../pages/project/ProjectDetail";
import UserDetail from "../../pages/user/UserDetail";
import HourlyReport from "../../pages/report/HourlyReport";
import ActivityLog from "../../pages/log/ActivityLog";
import ProjectActivity from "../../pages/log/ProjectActivity";
import StaffRating from "../../pages/report/StaffRating";
import StaffRatingQA from "../../pages/report/StaffRatingQA";
import TaskboardHoursReport from "../../pages/report/TaskboardHoursReport";
import TaskUnattended from '../../pages/task/TaskUnattended';
import Designation from '../../pages/designation/Designation';
import MeetingNote from '../../pages/meeting-note/MeetingNote';
import TestPage from '../../pages/TestPage';
import BucketTrackingReport from "../../pages/report/BucketTrackingReport";
import BucketTrackingReportByTask from "../../pages/report/BucketTrackingReportByTask";
import TicketSystem from "../../pages/ticket/TicketSystem";
import AddTicketSystem from "../../pages/ticket/AddTicketSystem";
import EditTicketSystem from "../../pages/ticket/EditTicketSystem";
import WorkReport from "../../pages/work-report/WorkReport";
import AddWorkReport from "../../pages/work-report/AddWorkReport";
import EditWorkReport from "../../pages/work-report/EditWorkReport";
import TimeTrackingReport from "../../pages/report/TimeTrackingReport";
import TimeTrackingReportByTask from "../../pages/report/TimeTrackingReportByTask";
import EmailTemplate from "../../pages/email-template/EmailTemplate";
import EditEmailTemplate from "../../pages/email-template/EditEmailTemplate";
import BucketPlanList from '../../pages/bucket/BucketPlanList';
import NoticeList from "../../pages/notice/NoticeList";
import AddNotice from "../../pages/notice/AddNotice";
import EditNotice from "../../pages/notice/EditNotice";
import TaskboardStaffHoursReport from "../../pages/report/TaskboardStaffHoursReport";
import ThresholdLeaveList from "../../pages/threshold-leave/ThresholdLeaveList";
import ThresholdLeaveEdit from "../../pages/threshold-leave/ThresholdLeaveEdit";
import ThresholdLeaveAdd from "../../pages/threshold-leave/ThresholdLeaveAdd";
import RemainingLeaveList from "../../pages/leave/RemainingLeaveList";
import ResourceAllocation from "../../pages/task-board/ResourceAllocation";
import DelayTaskReport from "../../pages/work-report/DelayTaskReport";
import RemoteWork from "../../pages/remote-work/RemoteWork";
import AiTaskboard from "../../pages/task-board/AiTaskboard";
import Topics from '../../../src/pages/Topics';
import TimeTrackingReportByProject from "../../pages/report/TimeTrackingReportByProject";
import ArticlePage from '../../pages/task/ArticlePage';

const routes = [
    {
        id: 1,
        name: "Home",
        title: "Taskme | Dashboard",
        path: "/",
        icon: "icon-home",
        exact: true,
        isMenu: true,
        isSetup: false,
        component: Dashboard,
    },
    {
        id: 16,
        name: "Projects",
        title: "Taskme | Projects",
        path: "/projects",
        icon: "icon-listing",
        exact: true,
        isMenu: true,
        isSetup: false,
        component: ProjectList,
        menuActivePaths: ['/projects', '/add-project', '/edit-project', '/project-detail'],
    },
    {
        id: 2,
        name: "Topics",
        title: "Taskme | All Dev Tasks",
        path: "/tasks",
        icon: "icon-task",
        exact: true,
        isMenu: true,
        isSetup: false,
        component: Mytask,
        permissions: ['article.view'],
        menuActivePaths: ['/tasks', '/set-task-priority', '/edit-task', '/view-task', '/kanban-tasks'],
    },
    {
        id: 3, 
        name: "Topics",
        title: "Taskme | Topics",
        path: "/topics/:projectId",
        icon: "icon-topics",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: Topics,
        permissions: ['tasks.view'],
        menuActivePaths: ['/topics'],
    },
    {
        id: 4,
        name: "Articles",
        title: "Taskme | Articles",
        path: "/article-tasks",
        icon: "icon-report",
        exact: true,
        isMenu: true,
        isSetup: false,
        component: ArticlePage, // New component for ArticleList
        permissions: ['article.view'],
        menuActivePaths: ['/article-tasks'],
    },
    // {
    //     id: 3,
    //     name: "Site Add-on Tasks",
    //     title: "Taskme | Site Add-on Tasks",
    //     path: "/site-addons-tasks",
    //     icon: "icon-add-on",
    //     exact: true,
    //     isMenu: true,
    //     isSetup: false,
    //     component: Mytask,
    //     permissions: ['tasks.view'],
    //     menuActivePaths: ['/site-addons-tasks', '/set-site-addons-task-priority', '/edit-site-addons-task', '/view-site-addons-task'],
    // },
    // {
    //     id: 4,
    //     name: "Favourite Tasks",
    //     title: "Taskme | Favourite Tasks",
    //     path: "/favourite-tasks",
    //     icon: "icon-bookmark",
    //     exact: true,
    //     isMenu: true,
    //     isSetup: false,
    //     component: Mytask,
    //     permissions: ['tasks.favourite'],
    //     menuActivePaths: ['/favourite-tasks', '/edit-favourite-task', '/view-favourite-task'],
    // },
    {
        id: 5,
        name: "Task View",
        title: "Taskme | Task View",
        path: "/view-task/:id",
        icon: "icon-task",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: Mytask,
        permissions: ['tasks.view'],
    },
    {
        id: 6,
        name: "Task Edit",
        title: "Taskme | Task Edit",
        path: "/edit-task/:id",
        icon: "icon-task",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: Mytask,
        permissions: ['tasks.update'],
    },
    {
        id: 7,
        name: "Task View",
        title: "Taskme | Task  View",
        path: "/view-site-addons-task/:id",
        icon: "icon-task",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: Mytask,
        permissions: ['tasks.view'],
    },
    {
        id: 8,
        name: "Task Edit",
        title: "Taskme | Task Edit",
        path: "/edit-site-addons-task/:id",
        icon: "icon-task",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: Mytask,
        permissions: ['tasks.update'],
    },
    {
        id: 9,
        name: "Favourite Tasks",
        title: "Taskme | Task View",
        path: "/view-favourite-task/:id",
        icon: "icon-bookmark",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: Mytask,
        permissions: ['tasks.view'],
    },
    {
        id: 10,
        name: "Favourite Tasks",
        title: "Taskme | Task Edit",
        path: "/edit-favourite-task/:id",
        icon: "icon-bookmark",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: Mytask,
        permissions: ['tasks.update'],
    },
    {
        id: 11,
        name: "Set Task Priority",
        title: "Taskme | Set Task Priority",
        path: "/set-task-priority/:agency_id",
        icon: "icon-task",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: SetTaskPriority,
        permissions: ['tasks.view'],
    },
    {
        id: 12,
        name: "Set Task Priority",
        title: "Taskme | Set Task Priority",
        path: "/set-site-addons-task-priority/:agency_id",
        icon: "icon-task",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: SetTaskPriority,
        permissions: ['tasks.view'],
    },
    {
        id: 13,
        name: "Task View",
        title: "Taskme | Task View",
        path: "/admin/tasks/view/:id",
        icon: "icon-task",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: Mytask,
        permissions: ['tasks.view'],
    },
    // {
    //     id: 89,
    //     name: "Weekly Resource Planing",
    //     title: "Taskme | Weekly Resource Planing",
    //     path: "/resource-allocation",
    //     icon: "icon-board",
    //     exact: true,
    //     isMenu: true,
    //     isSetup: false,
    //     component: ResourceAllocation,
    //     permissions: ['resource_allocation.view'],
    //     menuActivePaths: ['/resource-allocation'],
    // },
    {
        id: 17,
        name: "Edit Project",
        title: "Taskme | Edit Project",
        path: "/edit-project/:id",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: false,
        component: EditProject,
        permissions: ['projects.update'],
    },
    {
        id: 18,
        name: "Projects Detail",
        title: "Taskme | Project Details",
        path: "/project-detail/:id",
        icon: "",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: ProjectDetail,
        permissions: ['projects.view'],
    },
    // {
    //     id: 19,
    //     name: "Leaves",
    //     title: "Taskme | Leaves",
    //     path: "/leaves",
    //     icon: "icon-person-to-door",
    //     exact: true,
    //     isMenu: true,
    //     isSetup: false,
    //     component: Leaves,
    //     permissions: ['leaves.view'],
    //     menuActivePaths: ['/leaves','/today-approved-leave'],
    // },
    // {
    //     id: 20,
    //     name: "Leave Bucket",
    //     title: "Taskme | Leave Bucket",
    //     path: "/leave-bucket",
    //     icon: "icon-person-to-door",
    //     exact: true,
    //     isMenu: true,
    //     isSetup: true,
    //     component: LeaveBucket,
    //     permissions: ['leavebucket.view'],
    //     menuActivePaths: ['/leave-bucket'],
    // },
    {
        id: 21,
        name: "Agency Members",
        title: "Taskme | Agency Members",
        path: "/agency-users",
        icon: "icon-user-1",
        exact: true,
        isMenu: true,
        isSetup: true,
        component: AgencyUsers,
        permissions: ['agency_users.view'],
        menuActivePaths: ['/agency-users', '/add-agency-user', '/edit-agency-user', '/agency-user-detail', '/add-agency'],
    },
    {
        id: 22,
        name: "Staff Members",
        title: "Taskme | Staff Members",
        path: "/users",
        icon: "icon-user-1",
        exact: true,
        isMenu: true,
        isSetup: true,
        component: Users,
        permissions: ['users.view'],
        menuActivePaths: ['/users', '/add-user', '/edit-user', '/user-detail'],
    },
    // {
    //     id: 23,
    //     name: "Customers",
    //     title: "Taskme | Customers",
    //     path: "/customers",
    //     icon: "icon-users",
    //     exact: true,
    //     isMenu: true,
    //     isSetup: true,
    //     component: Customers,
    //     permissions: ['customers.view'],
    //     menuActivePaths: ['/customers', '/all-contacts', '/customer/profile', '/customer/contacts'],
    // },
    {
        id: 24,
        name: "Add User",
        title: "Taskme | Add User",
        path: "/add-user",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: true,
        component: AddUser,
        permissions: ['users.create'],
    },
    {
        id: 25,
        name: "Edit User",
        title: "Taskme | Edit User",
        path: "/edit-user/:id",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: true,
        component: EditUser,
        permissions: ['users.update'],
    },
    {
        id: 26,
        name: "Profile",
        title: "Taskme | Profile",
        path: "/profile",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: false,
        component: Profile,
    },
    {
        id: 27,
        name: "Add Role",
        title: "Taskme | Add Role",
        path: "/add-role",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: true,
        component: AddRole,
        permissions: ['roles.create'],
    },
    {
        id: 28,
        name: "Roles",
        title: "Taskme | RoleList",
        path: "/roles",
        icon: "icon-user-role",
        exact: true,
        isMenu: true,
        isSetup: true,
        component: RoleList,
        permissions: ['roles.view'],
        menuActivePaths: ['/add-role', '/roles', '/edit-role'],
    },
    {
        id: 29,
        name: "Edit Role",
        title: "Taskme | Edit Role",
        path: "/edit-role/:id",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: true,
        component: EditRole,
        permissions: ['roles.update'],
    },
    {
        id: 30,
        name: "Billing",
        title: "Taskme | Billing",
        path: "/plans/subscription",
        icon: "icon-tropy",
        exact: true,
        isMenu: true,
        isSetup: false,
        component: Subscriptions,
        permissions: ['subscriptions.view'],
        menuActivePaths: ['/plans/subscription', '/plans/manage-dev-plans', '/plans/manage-site-add-ons', '/plans/upcoming-invoice', '/plans/past-invoice', '/plans/update-card', '/plans/manage-bucket-plan'],
    },
    {
        id: 31,
        name: "Manage Dev Plans",
        title: "Taskme | Manage Dev Plans",
        path: "/plans/upgrade-downgrade-plan",
        icon: "icon-tropy",
        exact: true,
        isMenu: true,
        isSetup: false,
        component: ManageDevPlans,
        permissions: ['subscriptions.view'],
        menuActivePaths: ['/plans/upgrade-downgrade-plan'],
    },
    {
        id: 32,
        name: "Manage Dev Plans",
        title: "Taskme | Manage Dev Plans",
        path: "/plans/manage-dev-plans",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: false,
        component: ManageDevPlans,
        permissions: ['subscriptions.view'],
    },
    {
        id: 33,
        name: "Manage Site Add-ons",
        title: "Taskme | Manage Site Add-ons",
        path: "/plans/manage-site-add-ons",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: false,
        component: ManageSiteAddOns,
        permissions: ['subscriptions.view'],
    },
    {
        id: 34,
        name: "Upcoming Invoice",
        title: "Taskme | Upcoming Invoice",
        path: "/plans/upcoming-invoice",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: false,
        component: UpcomingInvoice,
        permissions: ['subscriptions.view'],
    },
    {
        id: 35,
        name: "Past Invoice",
        title: "Taskme | Past Invoice",
        path: "/plans/past-invoice",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: false,
        component: PastInvoice,
        permissions: ['subscriptions.view'],
    },
    {
        id: 36,
        name: "Update Card",
        title: "Taskme | Update Card",
        path: "/plans/update-card",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: false,
        component: UpdateCard,
        permissions: ['subscriptions.view'],
    },
    {
        id: 37,
        name: "Subscriptions",
        title: "Taskme | Subscriptions List",
        path: "/subscription",
        icon: "icon-tropy",
        exact: true,
        isMenu: true,
        isSetup: false,
        component: SubscriptionsList,
        permissions: ['subscriptionlist.view'],
        menuActivePaths: ['/subscription', '/subscription-invoice'],
    },
    // {
    //     id: 72,
    //     name: "Agency Bucket Plans",
    //     title: "Taskme | Agency Bucket Plans",
    //     path: "/bucket-plan-list",
    //     icon: "icon-time",
    //     exact: true,
    //     isMenu: true,
    //     isSetup: false,
    //     component: BucketPlanList,
    //     permissions: ['bucketlist.view'],
    //     menuActivePaths: ['/bucket-plan-list'],
    // },
    {
        id: 38,
        name: "Subscriptions Invoice",
        title: "Taskme | Subscriptions Invoice",
        path: "/subscription-invoice/:id",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: true,
        component: SubscriptionsInvoiceList,
        permissions: ['subscriptionlist.view'],
    },
    // {
    //     id: 39,
    //     name: "Agency Sites",
    //     title: "Taskme | Agency Sites",
    //     path: "/agency-sites",
    //     icon: "icon-department",
    //     exact: true,
    //     isMenu: true,
    //     isSetup: true,
    //     component: AgencySites,
    //     permissions: ['agencysites.view'],
    //     menuActivePaths: ['/agency-sites'],
    // },
    {
        id: 40,
        name: "Rating & Reviews",
        title: "Taskme | Rating & Reviews",
        path: "/rating-reviews",
        icon: "icon-star-line",
        exact: true,
        isMenu: true,
        isSetup: true,
        component: RatingReviews,
        permissions: ['ratings.view'],
        menuActivePaths: ['/rating-reviews'],
    },
    {
        id: 41,
        name: "Contacts",
        title: "Taskme | Contacts",
        path: "/all-contacts",
        icon: "icon-clipboard-list-check",
        exact: true,
        isMenu: false,
        isSetup: true,
        component: Contacts,
        permissions: ['customers.view'],
    },
    {
        id: 42,
        name: "Notification",
        title: "Taskme | Notification",
        path: "/notification",
        icon: "icon-notificatons",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: NotificationList,
        //permissions: ['customers.view'],
        menuActivePaths: ['/notification'],
    },
    {
        id: 43,
        name: "Clients",
        title: "Taskme | Clients",
        path: "/customer/profile/:id",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: true,
        component: CustomersProfile,
        permissions: ['customers.view'],
    },
    {
        id: 44,
        name: "Contacts",
        title: "Taskme | Contacts",
        path: "/customer/contacts/:id",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: true,
        component: CustomersContacts,
        permissions: ['customers.view'],
    },
    {
        id: 45,
        name: "User Detail",
        title: "Taskme | User Details",
        path: "/user-detail/:id",
        icon: "",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: UserDetail,
        //permissions: ['users.view'],
    },
    {
        id: 46,
        name: "Agency User Detail",
        title: "Taskme | Agency User Details",
        path: "/agency-user-detail/:id",
        icon: "",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: UserDetail,
        //permissions: ['users.view'],
    },
    {
        id: 47,
        name: "Hourly Report",
        title: "Taskme | Hourly Report",
        path: "/hourly-report",
        icon: "",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: HourlyReport,
    },
    {
        id: 48,
        name: "Activity Log",
        title: "Taskme | Activity Log",
        path: "/activity-log",
        icon: "icon-report",
        exact: true,
        isMenu: true,
        isSetup: true,
        component: ActivityLog,
        menuActivePaths: ['/activity-log'],
        permissions: ['logs.view'],
    },
    {
        id: 49,
        name: "Project Activity",
        title: "Taskme | Project Activity",
        path: "/project-activity",
        icon: "icon-report",
        exact: true,
        isMenu: true,
        isSetup: true,
        component: ProjectActivity,
        menuActivePaths: ['/project-activity'],
        permissions: ['logs.view'],
    },
    {
        id: 50,
        name: "Staff Rating",
        title: "Taskme | Staff Rating",
        path: "/staff-rating",
        icon: "",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: StaffRating,
    },
    {
        id: 51,
        name: "QA Staff Rating",
        title: "Taskme | QA Staff Rating",
        path: "/qa-staff-rating",
        icon: "",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: StaffRatingQA,
    },
    {
        id: 52,
        name: "Taskboard Hours Report",
        title: "Taskme | Taskboard Hours Report",
        path: "/taskboard-hours-report",
        icon: "",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: TaskboardHoursReport,
    },
    // {
    //     id: 53,
    //     name: "Task Unattended",
    //     title: "Taskme | Task Unattended",
    //     path: "/task-unattended",
    //     icon: "icon-task",
    //     exact: true,
    //     isMenu: true,
    //     isSetup: true,
    //     component: TaskUnattended,
    //     menuActivePaths: ['/task-unattended'],
    //     permissions: ['tasks.unattended'],
    // },
    {
        id: 54,
        name: "Designation",
        title: "Taskme | Designation",
        path: "/designation",
        icon: "icon-department",
        exact: true,
        isMenu: true,
        isSetup: true,
        component: Designation,
        menuActivePaths: ['/designation'],
        permissions: ['designations.view'],
    },
    {
        id: 55,
        name: "Meeting Note",
        title: "Taskme | Meeting Note",
        path: "/meeting-note",
        icon: "icon-listing",
        exact: true,
        isMenu: true,
        isSetup: false,
        component: MeetingNote,
        menuActivePaths: ['/meeting-note'],
        permissions: ['meeting_notes.view'],
    },
    {
        id: 56,
        name: "All Dev Tasks",
        title: "Taskme | All Dev Tasks",
        path: "/kanban-tasks",
        icon: "icon-task",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: KanbanTasks,
        permissions: ['tasks.view'],
    },
    {
        id: 57,
        name: "Test Page",
        title: "Taskme | Test Page",
        path: "/test-page",
        icon: "icon-task",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: TestPage,
        permissions: ['tasks.view'],
    },
    {
        id: 58,
        name: "Add Agency User",
        title: "Taskme | Add Agency User",
        path: "/add-agency-user",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: true,
        component: AddUser,
        permissions: ['agency_users.create'],
    },
    {
        id: 59,
        name: "Edit Agency User",
        title: "Taskme | Edit Agency User",
        path: "/edit-agency-user/:id",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: true,
        component: EditUser,
        permissions: ['agency_users.update'],
    },
    // {
    //     id: 60,
    //     name: "Manage Bucket Plans",
    //     title: "Taskme | Manage Bucket Plans",
    //     path: "/plans/manage-bucket-plan",
    //     icon: '',
    //     exact: true,
    //     isMenu: false,
    //     isSetup: false,
    //     component: ManageBucketPlans,
    //     permissions: ['subscriptions.view'],
    // },
    // {
    //     id: 61,
    //     name: "Bucket Tracking Report",
    //     title: "Taskme | Bucket Tracking Report",
    //     path: "/bucket-tracking-report",
    //     icon: 'icon-report',
    //     exact: true,
    //     isMenu: true,
    //     isSetup: true,
    //     component: BucketTrackingReport,
    //     permissions: ['bucketreport.view'],
    //     menuActivePaths: ['/bucket-tracking-report','/bucket-tracking-report-by-task'],
    // },
    {
        id: 74,
        name: "Bucket Hour Report",
        title: "Taskme | Bucket Hour Report",
        path: "/bucket-tracking-report-by-task",
        icon: 'icon-report',
        exact: true,
        isMenu: false,
        isSetup: false,
        component: BucketTrackingReportByTask,
        permissions: ['bucketreport.view'],
    },
    {
        id: 62,
        name: "Add Project",
        title: "Taskme | Add Project",
        path: "/add-project",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: false,
        component: AddProject,
        permissions: ['projects.create'],
    },
    // {
    //     id: 63,
    //     name: "Ticket",
    //     title: "Taskme | Ticket",
    //     path: "/it-ticket",
    //     icon: 'icon-message',
    //     exact: true,
    //     isMenu: true,
    //     isSetup: false,
    //     component: TicketSystem,
    //     permissions: ['ticket_system.view'],
    //     menuActivePaths: ['/it-ticket', '/add-it-ticket', '/edit-it-ticket', '/view-it-ticket'],
    // },
    {
        id: 64,
        name: "Add Ticket",
        title: "Taskme | Add Ticket",
        path: "/add-it-ticket",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: false,
        component: AddTicketSystem,
        permissions: ['ticket_system.create'],
    },
    {
        id: 65,
        name: "Edit Ticket",
        title: "Taskme | Edit Ticket",
        path: "/edit-it-ticket/:id",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: false,
        component: EditTicketSystem,
        permissions: ['ticket_system.update'],
    },
    {
        id: 66,
        name: "Ticket",
        title: "Taskme | Ticket",
        path: "/view-it-ticket/:id",
        icon: "",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: TicketSystem,
        permissions: ['ticket_system.view'],
    },
    // {
    //     id: 67,
    //     name: "Work Report",
    //     title: "Taskme | Work Report",
    //     path: "/work-report",
    //     icon: 'icon-time',
    //     exact: true,
    //     isMenu: true,
    //     isSetup: false,
    //     component: WorkReport,
    //     permissions: ['workreport.view'],
    //     menuActivePaths: ['/work-report', '/add-work-report', '/edit-work-report', '/view-work-report', '/delay-task-report'],
    // },
    // {
    //     id: 68,
    //     name: "Add Work Report",
    //     title: "Taskme | Add Work Report",
    //     path: "/add-work-report",
    //     icon: '',
    //     exact: true,
    //     isMenu: false,
    //     isSetup: false,
    //     component: AddWorkReport,
    //     permissions: ['workreport.create'],
    // },
    // {
    //     id: 69,
    //     name: "Edit Work Report",
    //     title: "Taskme | Edit Work Report",
    //     path: "/edit-work-report/:id",
    //     icon: '',
    //     exact: true,
    //     isMenu: false,
    //     isSetup: false,
    //     component: EditWorkReport,
    //     permissions: ['workreport.update'],
    // },
    // {
    //     id: 70,
    //     name: "Work Report",
    //     title: "Taskme | Work Report",
    //     path: "/view-work-report/:id",
    //     icon: "",
    //     exact: true,
    //     isMenu: false,
    //     isSetup: false,
    //     component: WorkReport,
    //     permissions: ['workreport.view'],
    // },
    // {
    //     id: 71,
    //     name: "Time Tracking Report",
    //     title: "Taskme | Time Tracking Report",
    //     path: "/time-tracking-report",
    //     icon: 'icon-report',
    //     exact: true,
    //     isMenu: true,
    //     isSetup: true,
    //     component: TimeTrackingReport,
    //     permissions: ['devreport.view'],
    //     menuActivePaths: ['/time-tracking-report'],
    // },
    {
        id: 75,
        name: "Development Hour Report",
        title: "Taskme | Development Hour Report",
        path: "/time-tracking-report-by-task",
        icon: 'icon-report',
        exact: true,
        isMenu: false,
        isSetup: false,
        component: TimeTrackingReportByTask,
        permissions: ['devreport.view'],
    },
    {
        id: 76,
        name: "Email Templates",
        title: "Taskme | Email Templates",
        path: "/email-templates",
        icon: 'icon-report',
        exact: true,
        isMenu: true,
        isSetup: true,
        component: EmailTemplate,
        permissions: ['email_template.view'],
        menuActivePaths: ['/email-templates','/email-template'],
    },
    {
        id: 77,
        name: "Edit Email Templates",
        title: "Taskme | Edit Email Templates",
        path: "/email-template/:id",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: false,
        component: EditEmailTemplate,
        permissions: ['email_template.update'],
    },
    {
        id: 78,
        name: "Today Approved Leave",
        title: "Taskme | Today Approved Leave",
        path: "/today-approved-leave",
        icon: "",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: TodayLeaves,
        permissions: ['leaves.today_approved_list'],
    },
    {
        id: 79,
        name: "Notice",
        title: "Taskme | Notice",
        path: "/notices",
        icon: "icon-task",
        exact: true,
        isMenu: true,
        isSetup: true,
        component: NoticeList,
        permissions: ['notice.view'],
        menuActivePaths: ['/notices', '/add-notice', '/view-notice'],
    },
    {
        id: 80,
        name: "Add Notice",
        title: "Taskme | Add Notice",
        path: "/add-notice",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: false,
        component: AddNotice,
        permissions: ['notice.create'],
    },
    {
        id: 81,
        name: "Notice",
        title: "Taskme | Notice",
        path: "/view-notice/:id",
        icon: "",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: NoticeList,
        permissions: ['notice.view'],
    },
    {
        id: 82,
        name: "Edit Notice",
        title: "Taskme | Edit Notice",
        path: "/edit-notice/:id",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: false,
        component: EditNotice,
        permissions: ['notice.update'],
    },
    {
        id: 83,
        name: "Add Agency",
        title: "Taskme | Add Agency",
        path: "/add-agency",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: true,
        component: AddUser,
        permissions: ['agency_users.create'],
    },
    {
        id: 84,
        name: "Taskboard Staff Hours Report",
        title: "Taskme | Taskboard Staff Hours Report",
        path: "/taskboard-staff-hours-report",
        icon: "",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: TaskboardStaffHoursReport,
    },
    // {
    //     id: 85,
    //     name: "Threshold Leave",
    //     title: "Taskme | Threshold Leave",
    //     path: "/threshold-leave-setting",
    //     icon: "icon-person-to-door",
    //     exact: true,
    //     isMenu: true,
    //     isSetup: true,
    //     component: ThresholdLeaveList,
    //     permissions: ['threshold_leave.view'],
    //     menuActivePaths: ['/threshold-leave-settings'],
    // },
    {
        id: 86,
        name: "Threshold Leave",
        title: "Taskme | Threshold Leave",
        path: "/view-threshold-leave-setting/:id",
        icon: "",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: ThresholdLeaveList,
        permissions: ['threshold_leave.view'],
    },
    {
        id: 87,
        name: "Edit Threshold Leave",
        title: "Taskme | Edit Threshold Leave",
        path: "/edit-threshold-leave-setting/:id",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: false,
        component: ThresholdLeaveEdit,
        permissions: ['threshold_leave.update'],
    },
    {
        id: 88,
        name: "Add Threshold Leave",
        title: "Taskme | Add Threshold Leave",
        path: "/add-threshold-leave-setting",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: false,
        component: ThresholdLeaveAdd,
        permissions: ['threshold_leave.create'],
    },    
    // {
    //     id: 90,
    //     name: "Remaining Leave List",
    //     title: "Taskme | Remaining Leave List",
    //     path: "/remaining-leave-list",
    //     icon: "icon-person-to-door",
    //     exact: true,
    //     isMenu: true,
    //     isSetup: true,
    //     component: RemainingLeaveList,
    //     permissions: ['leaves.view'],
    //     menuActivePaths: ['/remaining-leave-list'],
    // },
    {
        id: 91,
        name: "Delay Task Report",
        title: "Taskme | Delay Task Report",
        path: "/delay-task-report",
        icon: '',
        exact: true,
        isMenu: false,
        isSetup: false,
        component: DelayTaskReport,
        permissions: ['workreport.delay_task_report'],
    },
    // {
    //     id: 92,
    //     name: "Remote Work Request",
    //     title: "Taskme | Remote Work Request",
    //     path: "/remote-work",
    //     icon: "icon-task",
    //     exact: true,
    //     isMenu: true,
    //     isSetup: false,
    //     component: RemoteWork,
    //     permissions: ['remote_work.view'],
    //     menuActivePaths: ['/remote-work', '/view-remote-work'],
    // },
    {
        id: 94,
        name: "Remote Work Request",
        title: "Taskme | Remote Work Request",
        path: "/view-remote-work/:id",
        icon: "",
        exact: true,
        isMenu: false,
        isSetup: false,
        component: RemoteWork,
        permissions: ['remote_work.view'],
    },
    {
        id: 95,
        name: "Development Hour Report",
        title: "Taskme | Development Hour Report",
        path: "/time-tracking-report-by-project",
        icon: 'icon-report',
        exact: true,
        isMenu: false,
        isSetup: false,
        component: TimeTrackingReportByProject,
        permissions: ['devreport.view'],
    },
]

export default routes
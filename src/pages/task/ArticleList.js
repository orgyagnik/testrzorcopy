import React, { useState, useEffect } from "react";
import DataTableWithPagination from "../../modules/custom/DataTable/DataTableWithPagination";
import {
  pagination,
  display_date_format,
  databaseRoleCode,
  popperConfig,
  //taskPriorityList
} from "../../settings";
import moment from "moment";
import APIService from "../../api/APIService";
import {
  Dropdown,
  Tooltip,
  OverlayTrigger,
  Badge,
  Form,
  Modal,
  Button,
  Col,
  Row,
  Spinner,
} from "react-bootstrap";
import Select from "react-select";
import AvatarImg from "../../assets/img/placeholder-image.png";
import ReactImageFallback from "react-image-fallback";
import AdddashedIcon from "../../assets/img/icons/add-dashed.svg";
import SearchIcon from "../../assets/img/icons/serach.svg";
import { filterDropdownOptionByName, check } from "../../utils/functions.js";
import SimpleBar from "simplebar-react";
import { toast } from "react-toastify";
import { TASK_BULK_ACTION, COPY_LINK_MSG } from "../../modules/lang/Task";
import { confirmAlert } from "react-confirm-alert";
import { Link } from "react-router-dom";
import { setFavoritesTask } from "../../store/reducers/App";
import Store from "../../store";
import { format } from "date-fns";
import CommentIcon from "../../assets/img/icons/comment.svg";
import axios from 'axios';

export default function ArticleList({
  userData,
  agency,
  assigned_id,
  myFollowingTasks,
  staffId,
  recurringTask,
  project,
  deleteTask,
  cstShowViewTaskModal,
  cstShowEditTaskModal,
  updateTaskStatus,
  taskStatusList = [],
  refreshForNewPage,
  setRefreshForNewPage,
  refreshForList,
  setRefreshButtonProcess,
  task_type,
  showPriorityButton,
  setShowPriorityButton,
  customerId,
  filterStartDate,
  filterEndDate,
  lastOpenedTaskId,
}) {
  const [firstLoad, setFirstLoad] = useState(true);
  const [pageDesignRefresh, setPageDesignRefresh] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchFilter, setSearchFilter] = useState("");
  const [sort, setSort] = useState(
    userData?.role_code === databaseRoleCode.pcCode ||
      userData?.role_code === databaseRoleCode.agencyCode ||
      userData?.role_code === databaseRoleCode.agencyMemberCode
      ? "asc"
      : "desc"
  );
  const [sortby, setSortBy] = useState(
    userData?.role_code === databaseRoleCode.pcCode ||
      userData?.role_code === databaseRoleCode.agencyCode ||
      userData?.role_code === databaseRoleCode.agencyMemberCode
      ? "priority"
      : "id"
  );
  const [perPageSize, setPerPageSize] = useState(
    pagination.perPageRecordDatatable
  );
  const [taskList, setTaskList] = useState([]);
  const [exportData, setExportData] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [staffListForFilter, setStaffListForFilter] = useState([]);
  const [staffListForFilterForRemove, setStaffListForFilterForRemove] =
    useState([]);
  const [assignToSearch, setAssignToSearch] = useState("");
  const [assignToSearchForRemove, setAssignToSearchForRemove] = useState("");

  const [saveProcess, setSaveProcess] = useState(false);
  const [massDelete, setMassDelete] = useState(false);
  const [taskStatus, setTaskStatus] = useState(0);
  const [selectedAssignedBy, setSelectedAssignedBy] = useState([]);
  const [selectedAssignedByForRemove, setSelectedAssignedByForRemove] =
    useState([]);

  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [tableLoader, setTableLoader] = useState(false);
  const [customPrioritySortingSet, setCustomPrioritySortingSet] =
    useState(false);

  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [assignToSearchOnTask, setAssignToSearchOnTask] = useState("");
  const [staffListForFilterOnTask, setStaffListForFilterOnTask] = useState([]);
  const [staffListOnTask, setStaffListOnTask] = useState([]);
  const [selectedAssignedByOnTask, setSelectedAssignedByOnTask] = useState([]);
  const [stopRecurringTask, setStopRecurringTask] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [sendNotification, setSendNotification] = useState(true);
  const REACT_APP_API_PYTHON_URL = process.env.REACT_APP_API_PYTHON_URL;
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishUrl, setPublishUrl] = useState("");
  const [taskToPublish, setTaskToPublish] = useState(null);

  const changeTaskStatusWithUrl = (taskId, statusId, publishUrl = null) => {
    const params = {
      taskid: taskId,
      status: statusId,
      user_entered_url: publishUrl // Add this line
    };
  
    APIService.updateTask(params)
      .then((response) => {
        if (response.data?.status) {
          toast.success("Task status updated successfully", {
            position: toast.POSITION.TOP_RIGHT,
          });
          setRefreshForNewPage(!refreshForNewPage); // Refresh the task list
        } else {
          toast.error("Failed to update task status", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
      })
      .catch((error) => {
        toast.error("An error occurred", {
          position: toast.POSITION.TOP_RIGHT,
        });
      });
  };

  const handlePublish = () => {
    if (publishUrl.trim() !== "") {
      updateTaskStatus(taskToPublish, 5, publishUrl); // Use the parent's function
      setShowPublishModal(false);
      setPublishUrl("");
    } else {
      toast.error("Please enter a valid URL", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };  

  useEffect(() => {
    fetchTaskList();
    setFirstLoad(false);
  }, [sort, sortby, page, perPageSize, refreshForNewPage]);

  useEffect(() => {
    if (agency !== "") {
      setSort("asc");
      setSortBy("priority");
      setRefreshForNewPage(!refreshForNewPage);
      setCustomPrioritySortingSet(!customPrioritySortingSet);
    } else {
      if (firstLoad === false) {
        setRefreshForNewPage(!refreshForNewPage);
      }
    }
  }, [agency]);

  useEffect(() => {
    if (firstLoad === false) {
      setPage(1);
      if (page === 1) {
        const timer = setTimeout(() => {
          fetchTaskList();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [
    searchFilter,
    assigned_id,
    myFollowingTasks,
    staffId,
    recurringTask,
    project,
    refreshForList,
    customerId,
    filterStartDate,
    filterEndDate,
  ]);

  useEffect(() => {
    APIService.getAllMembers("").then((response) => {
      if (response.data?.status) {
        setStaffList(response.data?.data);
        setStaffListForFilter(response.data?.data);
        setStaffListForFilterForRemove(response.data?.data);
      }
    });
  }, []);

  const copyTaskLink = (taskId, task_type) => {
    if (task_type === 1) {
      navigator.clipboard.writeText(
        `${window.location.origin}/view-site-addons-task/${taskId}`
      );
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/view-task/${taskId}`
      );
    }
    toast.success(COPY_LINK_MSG, { position: toast.POSITION.TOP_RIGHT });
  };

  const prepareExportData = (data) => {
    let exportHeader = [];
    if (userData?.role_code !== databaseRoleCode.clientCodeagency) {
      exportHeader = [
        "#",
        "Task Name",
        "Project Name",
        "Start Date",
        "Due Date",
        "Priority Order",
        "Status",
        "Assigned to",
      ];
    } else {
      exportHeader = [
        "#",
        "Task Name",
        "Project Name",
        "Start Date",
        "Due Date",
        "Priority Order",
        "Status",
      ];
    }
    let exportData = [];
    data?.map((item) => {
      if (userData?.role_code !== databaseRoleCode.clientCode) {
        exportData.push({
          id: item.id,
          name: {
            t: "s",
            f: `HYPERLINK("${item.task_hyperlink}", "${item.name}")`,
          },
          project_name: item.project_name,
          startdate: item.startdate
            ? moment(item.startdate).format(display_date_format)
            : "",
          duedate: item.duedate
            ? moment(item.duedate).format(display_date_format)
            : "",
          priority: item.priority ? item.priority : "",
          task_status_name: item.task_status_name,
          assign_member:
            item.assign_member.length > 0
              ? item.assign_member
                  ?.map((user, index) => {
                    return user.name;
                  })
                  .join()
              : "",
        });
      } else {
        exportData.push({
          id: item.id,
          name: {
            t: "s",
            f: `HYPERLINK("${item.task_hyperlink}", "${item.name}")`,
          },
          project_name: item.project_name,
          startdate: item.startdate
            ? moment(item.startdate).format(display_date_format)
            : "",
          duedate: item.duedate
            ? moment(item.duedate).format(display_date_format)
            : "",
          priority: item.priority ? item.priority : "",
          task_status_name: item.task_status_name,
        });
      }
      return "";
    });
    if (task_type === 1)
      setExportData({
        fileName: "site-addons-task-data",
        sheetTitle: "Site Addons Task Data",
        exportHeader: exportHeader,
        exportData: exportData,
      });
    else
      setExportData({
        fileName: "all-dev-tasks",
        sheetTitle: "All Dev Tasks",
        exportHeader: exportHeader,
        exportData: exportData,
      });
  };

  const fetchTaskList = () => {
    setTableLoader(true);
    let selected_status = taskStatusList
      .filter(function (arr) {
        return arr.isChecked === true;
      })
      .map((a) => a.id);

    let task_type_new =
      userData?.role_code === databaseRoleCode.clientCode ? "0,1" : task_type;
    let params =
      "?assigned_to_me=" +
      assigned_id +
      "&task_type=" +
      task_type_new +
      "&my_following_tasks=" +
      myFollowingTasks;
    params = params + "&limit=" + perPageSize + "&page=" + page;
    // if (showPriorityButton) {
    //   params = params + "&sort=asc&sort_by=priority";
    // } else {
    //   params = params + "&sort=" + sort + "&sort_by=" + sortby;
    // }
    params = params + "&sort=" + sort + "&sort_by=" + sortby;

    // Add action_value=1 filter for ArticleList
    params = params + "&action_value=1";

    if (recurringTask) {
      params = params + "&recurring=1";
    }
    if (project && project.id) {
      params = params + "&search_by_project=" + project.id;
    }
    if (agency && agency.id) {
      params = params + "&search_by_agency=" + agency.id;
    }
    if (searchFilter !== "") {
      params = params + "&search=" + searchFilter;
    }
    if (selected_status.length > 0) {
      params = params + "&search_by_status=" + selected_status.join();
    }
    if (staffId && staffId.length > 0) {
      let staff_id_list = staffId.map((obj) => obj.id);
      params = params + "&staffid=" + staff_id_list.join(",");
    }
    if (filterStartDate && filterEndDate) {
      params =
        params + "&filter_startdate=" + format(filterStartDate, "yyyy-MM-dd");
      params =
        params + "&filter_enddate=" + format(filterEndDate, "yyyy-MM-dd");
    }

    params = params + `&customer_id=${customerId ? customerId : 0}`;
    if (
      sort === "asc" &&
      sortby === "priority" &&
      (agency !== "" ||
        userData?.role_code === databaseRoleCode.agencyCode ||
        userData?.role_code === databaseRoleCode.agencyMemberCode)
    ) {
      setShowPriorityButton(true);
    } else {
      setShowPriorityButton(false);
    }

    APIService.getArticleList(params).then((response) => {
      if (response.data?.status) {
        setTotalPages(response.data?.pagination?.total_pages);
        setTotalRecords(response.data?.pagination?.total_records);
        setTaskList(response.data?.data);
        prepareExportData(response.data?.data);
        setTableLoader(false);
      }
      setRefreshButtonProcess(false);
    });
  };

  const handleAddRemoveFavorite = (id) => {
    let params = {};
    params["taskid"] = id;
    params["remove"] = 1;
    params["staffid"] = userData?.id;
    APIService.addRemoveFavorite(params).then((response) => {
      if (response.data?.status) {
        toast.success(response.data?.message, {
          position: toast.POSITION.TOP_RIGHT,
        });
        APIService.getFavavoriteTasks().then((response) => {
          if (response.data?.status) {
            Store.dispatch(setFavoritesTask(response.data?.data));
          }
        });
        setRefreshForNewPage(!refreshForNewPage);
      } else {
        toast.error(response.data?.message, {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    });
  };

  const handleActionChange = (taskId, actionValue) => {
    const params = {
      taskid: taskId, // Ensure this matches the expected parameter name in the backend
      action_value: actionValue,
    };

    APIService.updateTask(params)
      .then((response) => {
        if (response.data?.status) {
          toast.success("Action updated successfully", {
            position: toast.POSITION.TOP_RIGHT,
          });
          setRefreshForNewPage(!refreshForNewPage); // Refresh the task list
        } else {
          toast.error("Failed to update action", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
      })
      .catch((error) => {
        toast.error("An error occurred", {
          position: toast.POSITION.TOP_RIGHT,
        });
      });
  };

  // Add this function to ArticleList component
  const generateArticle = async (taskId, taskData) => {
    let loadingToastId;
    try {
      const response2 = await APIService.getTaskById(taskId);
      if (!response2?.data?.status) {
            toast.error("Failed to retrieve task details.", {
                position: toast.POSITION.TOP_RIGHT
            });
            return;
      }
      const taskInfo = response2.data.data;
      const googleDocUrl = taskInfo?.google_doc_url;
      // Format the payload with arrays
      const payload = {
        taskid: taskId,
        title: [taskData?.name || ''], // Wrap title in array
        keywords: taskData?.keywords?.split(',').map(k => k.trim()) || [], // Split keywords string into array
        company_name: taskData?.project_name || '' // Company name stays as string
      };
  
      console.log("Payload being sent:", payload);
  
      // Validate required fields with specific messages
      const missingFields = [];
      if (!payload.title[0]) missingFields.push("Title");
      if (payload.keywords.length === 0) missingFields.push("Keywords");
      if (!payload.company_name) missingFields.push("Company Name");
  
      if (missingFields.length > 0) {
        const errorMessage = `Please provide the following required information: ${missingFields.join(", ")}`;
        toast.error(errorMessage, {
          position: toast.POSITION.TOP_RIGHT
        });
        return;
      }
  
      // Show loading toast
      loadingToastId = toast.loading("Generating article...");
  
      // Make request to Python server
      const response = await axios.post(
        `${REACT_APP_API_PYTHON_URL ? REACT_APP_API_PYTHON_URL : "https://razorcopy-py.sitepreviews.dev"}/generate-article`,
        payload
      );
  
      if (response.data?.article) {
        toast.success("Article generated successfully", {
          position: toast.POSITION.TOP_RIGHT
        });

        if (googleDocUrl) {
          await APIService.updateGoogleDocContent({
            googleDocUrl: googleDocUrl,
            articleContent: response.data.article
          });        
        }
  
        // Store the generated article in the task
        await APIService.updateTask({
          taskid: taskId,
          generated_article: response.data.article,
          avg_word_count: response.data.avg_word_count
        });
  
        // Optionally, show the article in a modal or update the UI
        cstShowViewTaskModal(taskId, response.data.article);
      } else {
        toast.error(response.data?.message || "Failed to generate article", {
          position: toast.POSITION.TOP_RIGHT
        });
      }
  
    } catch (error) {
      console.error("Generate Article Error:", error);
      
      // More detailed error message
      const errorMessage = error.response?.data?.detail
        ? `Error: ${JSON.stringify(error.response.data.detail)}`
        : "An error occurred while generating article";
      
      toast.error(errorMessage, {
        position: toast.POSITION.TOP_RIGHT
      });
    } finally {
      // Dismiss the loading toast
      toast.dismiss(loadingToastId);
    }
  };

  let columns = [
    {
      Header: () => (
        <div className="p-3" backgroundColor= '#f2f2f2'>
          <Form.Check
            className="d-flex align-items-center form-check-md mb-0"
            checked={
              taskList.length > 0 &&
              taskList.length ===
                taskList.filter(function (arr) {
                  return arr.selected === true;
                }).length
            }
            onChange={(e) => onSelectAllCheck(e)}
          />
        </div>
      ),
      id: "select_all",
      disableSortBy: true,
      Cell: ({ row }) => (
        <div className="p-3">
          <Form.Check
            className="d-flex align-items-center form-check-md mb-0"
            checked={row?.original?.selected}
            onChange={(e) => onItemCheck(e, row?.original)}
          />
        </div>
      ),
    },
    // {
    //   Header: "#",
    //   id: "id",
    //   disableSortBy: false,
    //   accessor: (taskList) => taskList.name,
    //   Cell: ({ row }) => (
    //     <>
    //       <div
    //         onClick={() => {
    //           cstShowViewTaskModal(row?.original?.id);
    //         }}
    //         className={`cursor-pointer ${
    //           row?.original.last_comment_by_agency === true &&
    //           (userData?.role_code === databaseRoleCode.adminCode ||
    //             userData?.role_code === databaseRoleCode.pcCode ||
    //             userData?.role_code === databaseRoleCode.accountantCode ||
    //             userData?.role_code === databaseRoleCode.teamLeadCode)
    //             ? "text-warning"
    //             : ""
    //         }`}
    //       >
    //         {row?.original?.id}
    //       </div>
    //     </>
    //   ),
    // },
    {
      Header: "Name",
      id: "name",
      disableSortBy: false,
      accessor: (taskList) => taskList.name,
      Cell: ({ row }) => (
        <div className="p-3">
          <div
            onClick={() => {
              cstShowViewTaskModal(row?.original?.id);
            }}
            className="cursor-pointer d-flex flex-column align-items-start"
          >
            <div className="list-table-task-name d-flex align-items-start">
              <div className="d-flex flex-column align-items-start">
                <Link
                  to={
                    row?.original?.task_type === 1
                      ? `/view-site-addons-task/${row?.original?.id}`
                      : `/view-task/${row?.original?.id}`
                  }
                  className="pointer-events-none"
                >
                  {row?.original?.name}
                </Link>
  
                <Link
                  to={`/project-detail/${row?.original?.project_id}`}
                  className="font-12 my-1"
                >
                  {row?.original?.project_name}
                </Link>
  
                {row?.original?.recurring === 1 && (
                  <Badge
                    bg="info"
                    className="font-weight-semibold font-12 p-2 mt-1"
                  >
                    Recurring Task
                  </Badge>
                )}
              </div>
  
              <div className="d-flex align-items-center">
                {row?.original?.comment_count > 0 &&
                  userData?.role_code !== databaseRoleCode.clientCode && (
                    <div
                      className="ms-7 align-items-start d-inline-flex rounded-10 px-2 py-1 border border-gray-200"
                      style={{ minWidth: "44px" }}
                    >
                      <span className="d-flex align-items-center">
                        <img
                          src={CommentIcon}
                          alt="Comment"
                          className="text-gray-150"
                          width="13"
                          height="auto"
                        />
                        <span className="ms-1 text-gray-150">
                          {row.original.comment_count}{" "}
                        </span>
                      </span>
                    </div>
                  )}
                {row?.original?.rating && row?.original?.task_status === 5 && (
                  <div className="task-rating ms-4 d-inline-block">
                    <i
                      className={`${
                        row?.original?.rating >= 1
                          ? "icon-star"
                          : "icon-star-line"
                      }`}
                    ></i>
                    <i
                      className={`${
                        row?.original?.rating >= 2
                          ? "icon-star"
                          : "icon-star-line"
                      }`}
                    ></i>
                    <i
                      className={`${
                        row?.original?.rating >= 3
                          ? "icon-star"
                          : "icon-star-line"
                      }`}
                    ></i>
                    <i
                      className={`${
                        row?.original?.rating >= 4
                          ? "icon-star"
                          : "icon-star-line"
                      }`}
                    ></i>
                    <i
                      className={`${
                        row?.original?.rating === 5
                          ? "icon-star"
                          : "icon-star-line"
                      }`}
                    ></i>
                  </div>
                )}
              </div>
            </div>
  
            {/* <div className="font-12 my-1">{row?.original?.project_name}</div> */}
          </div>
          <div className="row-action mt-1">
            <span
              className="text-primary cursor-pointer"
              onClick={() => {
                copyTaskLink(row?.original?.id, row?.original?.task_type);
              }}
            >
              Copy Link
            </span>
  
            <span className="font-12 px-1">|</span>
            <Link
              to={
                row?.original?.task_type === 1
                  ? `/view-site-addons-task/${row?.original?.id}`
                  : `/view-task/${row?.original?.id}`
              }
              target="_blank"
              className="text-primary cursor-pointer"
            >
              View
            </Link>
            {check(["tasks.update"], userData?.role.getPermissions) ||
            check(["tasks.delete"], userData?.role.getPermissions) ? (
              <span className="font-12 px-1">|</span>
            ) : (
              ""
            )}
            {check(["tasks.update"], userData?.role.getPermissions) && (
              <>
                {userData?.role_code !== databaseRoleCode.clientCode ||
                row?.original?.settings?.edit_tasks === 1 ? (
                  <span
                    className="text-primary cursor-pointer"
                    onClick={() => {
                      cstShowEditTaskModal(row?.original?.id);
                    }}
                  >
                    Edit
                  </span>
                ) : (
                  ""
                )}
              </>
            )}
            {check(["tasks.update"], userData?.role.getPermissions) &&
              check(["tasks.delete"], userData?.role.getPermissions) && (
                <span className="font-12 px-1">|</span>
              )}
            {check(["tasks.delete"], userData?.role.getPermissions) && (
              <>
                {userData?.role_code !== databaseRoleCode.clientCode ||
                (userData?.role_code === databaseRoleCode.clientCode &&
                  row?.original?.added_by === userData?.id &&
                  row?.original?.is_added_from_contact === 1) ? (
                  <span
                    className="text-danger cursor-pointer"
                    onClick={() => {
                      deleteTask(row?.original?.id);
                    }}
                  >
                    Delete
                  </span>
                ) : (
                  ""
                )}
              </>
            )}
            {task_type === 3 && (
              <>
                <span className="font-12 px-1">|</span>
                <span
                  className="text-primary cursor-pointer"
                  onClick={() => {
                    handleAddRemoveFavorite(row?.original?.id);
                  }}
                >
                  Unfavourite
                </span>
              </>
            )}
            <span className="font-12 px-1">|</span>
            <span
              className="text-success cursor-pointer"
              onClick={() => {
                generateArticle(row?.original?.id, row?.original);
              }}
            >
              Generate Article
              </span>
          </div>
        </div>
      ),
    },
    {
      Header: "Keyword",
      id: "keywords",
      disableSortBy: false,
      accessor: (taskList) => taskList.keywords,
      Cell: ({ row }) => (
        <div className="p-3">
          <div>
            {row?.original?.keywords
              ? row.original.keywords.replace(/"/g, "").split(",").join(", ")
              : "No Keywords"}
          </div>
        </div>
      ),
    },
    // {
    //     Header: 'Start Date',
    //     id: 'startdate',
    //     disableSortBy: false,
    //     accessor: (taskList) => taskList.startdate && moment(taskList.startdate).format(display_date_format),
    // },
    // {
    //     Header: 'Due Date',
    //     id: 'duedate',
    //     disableSortBy: false,
    //     accessor: (taskList) => taskList.duedate && moment(taskList.duedate).format(display_date_format),
    // },
    {
      /*Header: () => (
                <>
                    {"Priority Order"}
                    {showPriorityButton && <span> 🔼</span>}
                </>
            ),*/
      Header: "Priority Order",
      id: "priority",
      disableSortBy: false,
      accessor: (taskList) => taskList.priority,
    },
    {
      Header: "Volume",
      id: "keyword_volume",
      disableSortBy: false,
      accessor: (taskList) => taskList.keyword_volume,
    },
    {
      Header: "Keyword Difficulty",
      id:"keyword_difficulty",
      disableSortBy: false,
      accessor: (taskList) => taskList.keyword_difficulty,
    },
    {
      Header: "Status",
      id: "status",
      disableSortBy: false,
      accessor: (taskList) => taskList.status, // ✅ Use 'status' instead of 'task_status_name'
      Cell: ({ row }) => (
        <>
          {check(["article.update"], userData?.role.getPermissions) ? (
            <Dropdown>
              <Dropdown.Toggle
                size="sm"
                variant="info"
                id={`dropdown-status-${row?.original?.id}`}
                className="custom-btn-radius"
              >
                {row?.original?.status || "Unknown"} {/* Ensure fallback value */}
              </Dropdown.Toggle>
    
              <Dropdown.Menu>
                {taskStatusList
                  .filter((statusItem) => statusItem.id !== row?.original?.status)
                  .map((statusItem, index) => (
                    <Dropdown.Item
                      key={index}
                      onClick={() => updateTaskStatus(row?.original?.id, statusItem.id)}
                    >
                      {`Mark as ${statusItem.label}`}
                    </Dropdown.Item>
                  ))}
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Badge className="font-weight-semibold font-12 p-2" bg="info">
              {row?.original?.status || "Unknown"}
            </Badge>
          )}
        </>
      ),
    },
    
  ];

  if (userData?.role_code !== databaseRoleCode.clientCode) {
    columns = [
      ...columns,
      {
        Header: "Assigned to",
        id: "assigned_to",
        disableSortBy: true,
        accessor: (taskList) => taskList.assign_member,
        Cell: ({ row }) => (
          <>
            <div className="avatar-group">
              {row?.original?.assign_member
                ?.sort((a, b) =>
                  a.id === row?.original?.added_by
                    ? -1
                    : b.id === row?.original?.added_by
                    ? 1
                    : 0
                )
                .map((user, index) => {
                  return (
                    index < 5 && (
                      <span
                        className="avatar avatar-sm avatar-circle"
                        key={index}
                      >
                        {userData.role_code !== databaseRoleCode.clientCode &&
                        userData.role_code !== databaseRoleCode.agencyCode &&
                        userData.role_code !==
                          databaseRoleCode.agencyMemberCode ? (
                          <Link
                            to={`${
                              user.is_not_staff === 1
                                ? "/agency-user-detail/"
                                : "/user-detail/"
                            }${user.id}`}
                          >
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id={`tooltip-${user.name}`}>
                                  {" "}
                                  {user.name}
                                </Tooltip>
                              }
                            >
                              {user.profile_image !== "" &&
                              user.profile_image !== null ? (
                                <ReactImageFallback
                                  src={`${user.profile_image}`}
                                  fallbackImage={AvatarImg}
                                  initialImage={AvatarImg}
                                  alt={user.name}
                                  className={`avatar-img ${
                                    user?.id === row?.original?.added_by
                                      ? "border-orange-500"
                                      : ""
                                  } `}
                                />
                              ) : (
                                <img
                                  className={`avatar-img ${
                                    user?.id === row?.original?.added_by
                                      ? "border-orange-500"
                                      : ""
                                  } `}
                                  src={AvatarImg}
                                  alt={user.name}
                                />
                              )}
                            </OverlayTrigger>
                          </Link>
                        ) : (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-${user.name}`}>
                                {" "}
                                {user.name}
                              </Tooltip>
                            }
                          >
                            {user.profile_image !== "" &&
                            user.profile_image !== null ? (
                              <ReactImageFallback
                                src={`${user.profile_image}`}
                                fallbackImage={AvatarImg}
                                initialImage={AvatarImg}
                                alt={user.name}
                                className={`avatar-img ${
                                  user?.id === row?.original?.added_by
                                    ? "border-orange-500"
                                    : ""
                                } `}
                              />
                            ) : (
                              <img
                                className={`avatar-img ${
                                  user?.id === row?.original?.added_by
                                    ? "border-orange-500"
                                    : ""
                                } `}
                                src={AvatarImg}
                                alt={user.name}
                              />
                            )}
                          </OverlayTrigger>
                        )}
                      </span>
                    )
                  );
                })}

              {check(["tasks.update"], userData?.role.getPermissions) &&
              (userData?.role_code !== databaseRoleCode.clientCode ||
                row?.original?.settings?.edit_tasks === 1) ? (
                <span className="avatar avatar-sm avatar-circle">
                  <Dropdown
                    className="assigned-drop-down dropdown"
                    onToggle={(isOpen) =>
                      setDropdownOpen(isOpen ? row?.original?.id : false)
                    }
                    autoClose="outside"
                    show={dropdownOpen === row?.original?.id}
                    onSelect={onAssignBySelectOnTask}
                  >
                    <Dropdown.Toggle
                      as="a"
                      bsPrefix="no-toggle"
                      className="dark-2 font-weight-medium font-12 cursor-pointer"
                      id="assign"
                    >
                      <img
                        className="avatar-img"
                        alt="Profile"
                        src={AdddashedIcon}
                        onClick={(e) =>
                          handleAllProjectAssignMembersOnTask(
                            e,
                            row?.original?.id,
                            row?.original?.project_id,
                            row?.original?.assign_member
                          )
                        }
                      />
                    </Dropdown.Toggle>

                    {staffListForFilterOnTask.length > 0 && (
                      <Dropdown.Menu as="ul" className="p-2">
                        {/* <Dropdown.Header className="d-flex align-items-center pt-4 pb-3 pb-0 px-4">
                                                    <div className="search-box w-100">
                                                        <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                                            <img src={SearchIcon} alt="Search" />
                                                            <input type="search" id={`search-${row?.original?.id}`} className="form-control border-0" placeholder="Name" value={assignToSearchOnTask} onChange={(e) => handleAssignToSearchOnTask(e, e.target.value)} autoFocus={assignToSearchOnTask.length > 0} onFocus={(e) => e.target.setSelectionRange(assignToSearchOnTask.length, assignToSearchOnTask.length)} />

                                                        </div>
                                                    </div>
                                                </Dropdown.Header> */}

                        <SimpleBar className="dropdown-body">
                          {staffListForFilterOnTask.map((drp, index) => (
                            <Dropdown.Item
                              as="li"
                              key={index}
                              eventKey={drp.id}
                              className={`${
                                selectedAssignedByOnTask.filter(function (arr) {
                                  return arr.id === drp.id;
                                }).length > 0
                                  ? "active"
                                  : ""
                              }`}
                            >
                              <div className="d-flex d-flex align-items-center cursor-pointer w-100">
                                {drp.profile_image !== "" &&
                                drp.profile_image !== null ? (
                                  <img
                                    className="avatar avatar-xs avatar-circle me-1"
                                    src={`${drp.profile_image}`}
                                    alt={drp.name}
                                    onError={({ currentTarget }) => {
                                      currentTarget.onerror = null;
                                      currentTarget.src = AvatarImg;
                                    }}
                                  />
                                ) : (
                                  <img
                                    className="avatar avatar-xs avatar-circle me-1"
                                    src={AvatarImg}
                                    alt={drp.name}
                                  />
                                )}
                                <div className="ps-3">
                                  <div className="font-weight-regular dark-1 font-14 d-block">
                                    {drp.name}
                                  </div>
                                </div>
                              </div>
                            </Dropdown.Item>
                          ))}
                        </SimpleBar>
                      </Dropdown.Menu>
                    )}
                  </Dropdown>
                </span>
              ) : (
                ""
              )}
            </div>
          </>
        ),
      },
    //   {
    //     Header: "Action",
    //     id: "action",
    //     disableSortBy: true,
    //     Cell: ({ row }) => (
    //       <>
    //         <OverlayTrigger
    //           placement="top"
    //           overlay={
    //             <Tooltip id={`tooltip-approve-${row?.original?.id}`}>
    //               Approve
    //             </Tooltip>
    //           }
    //         >
    //           <Button
    //             variant="success"
    //             size="sm"
    //             onClick={() => handleActionChange(row?.original?.id, 1)}
    //             disabled={row?.original?.action === 1}
    //             className="me-2" // Bootstrap class for margin-end
    //           >
    //             <i className="fa fa-check"></i>
    //           </Button>
    //         </OverlayTrigger>
    //         <OverlayTrigger
    //           placement="top"
    //           overlay={
    //             <Tooltip id={`tooltip-reject-${row?.original?.id}`}>
    //               Reject
    //             </Tooltip>
    //           }
    //         >
    //           <Button
    //             variant="danger"
    //             size="sm"
    //             onClick={() => handleActionChange(row?.original?.id, 0)}
    //             disabled={row?.original?.action === 0}
    //           >
    //             <i className="fa fa-times"></i>
    //           </Button>
    //         </OverlayTrigger>
    //       </>
    //     ),
    //   },
    ];
  }

  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest(".assigned-drop-down")) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", closeDropdown);

    return () => {
      document.removeEventListener("click", closeDropdown);
    };
  }, []);

  const handleAllProjectAssignMembersOnTask = (
    e,
    taskId,
    projectId,
    AlreadyAssignMembers
  ) => {
    e.preventDefault();

    setDropdownOpen(taskId);
    setSelectedAssignedByOnTask(AlreadyAssignMembers);

    setStaffListOnTask([]);
    setStaffListForFilterOnTask([]);

    APIService.getAllProjectMembers(projectId).then((response) => {
      if (response.data?.status) {
        setStaffListOnTask(response.data?.data);
        setStaffListForFilterOnTask(response.data?.data);
      } else {
        setStaffListOnTask([]);
        setStaffListForFilterOnTask([]);
      }
    });
  };

  const handleAssignToSearchOnTask = (e, value) => {
    e.preventDefault();
    setAssignToSearchOnTask(value);
    filterDropdownOptionByName(
      staffListOnTask,
      value,
      setStaffListForFilterOnTask
    );
  };

  const onAssignBySelectOnTask = (e) => {
    handleAssignToSearch("");
    let id = parseInt(e);
    if (id > 0) {
      let addRemovechk =
        selectedAssignedByOnTask.filter(function (arr) {
          return arr.id === id;
        }).length > 0;
      if (!addRemovechk) {
        let newstaffList = staffListOnTask.filter(function (arr) {
          return arr.id === id;
        });
        setSelectedAssignedByOnTask(
          selectedAssignedByOnTask.concat(newstaffList)
        );
        let params = {};
        params["taskid"] = dropdownOpen;
        params["assigned_members"] = `${id}`;
        params["remove"] = 0;
        APIService.updateAssignMembers(params).then((response) => {});
      } else {
        let newstaffList = selectedAssignedByOnTask.filter(function (arr) {
          return arr.id !== id;
        });
        if (newstaffList.length > 0) {
          setSelectedAssignedByOnTask(newstaffList);
          let params = {};
          params["taskid"] = dropdownOpen;
          params["assigned_members"] = `${id}`;
          params["remove"] = 1;
          APIService.updateAssignMembers(params).then((response) => {});
        } else {
          toast.error(
            "Assigned to is required fields so need to be at least one",
            {
              position: toast.POSITION.TOP_RIGHT,
            }
          );
        }
      }
    }
  };

  const onItemCheck = (e, data) => {
    let tempList = taskList;
    let selectedChk = e.target;
    tempList.forEach((list) => {
      if (list.id === data.id) list.selected = selectedChk.checked;
    });
    setTaskList(tempList);
    setPageDesignRefresh(!pageDesignRefresh);

    //for selected task export
    if (
      taskList.filter(function (arr) {
        return arr.selected === true;
      }).length > 0
    ) {
      let tempListNew = taskList.filter(function (arr) {
        return arr.selected === true;
      });
      prepareExportData(tempListNew);
      setIsCheckboxChecked(true);
    } else {
      prepareExportData(tempList);
      setIsCheckboxChecked(false);
    }
  };

  const onSelectAllCheck = (e) => {
    let tempList = taskList;
    if (e.target.checked) {
      tempList.forEach((list) => {
        list.selected = true;
      });
      setIsCheckboxChecked(true);
    } else {
      tempList.forEach((list) => {
        list.selected = false;
      });
      setIsCheckboxChecked(false);
    }
    setTaskList(tempList);
    setPageDesignRefresh(!pageDesignRefresh);
    prepareExportData(tempList);
  };

  const handleBulkAction = (e) => {
    if (
      taskList.filter(function (arr) {
        return arr.selected === true;
      }).length > 0
    ) {
      setShowBulkActionModal(true);
    } else {
      toast.error("Please select at least one row", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  useEffect(() => {}, [pageDesignRefresh]);

  const cstSetCloseBulkActionModal = () => {
    setShowBulkActionModal(false);
    setTimeout(() => {
      clearControl();
    }, 200);
  };

  const clearControl = async () => {
    setMassDelete(false);
    setTaskStatus(0);
    //setTaskPriority(0);
    setSelectedAssignedBy([]);
    setSelectedAssignedByForRemove([]);
    setStopRecurringTask(false);
    setSendEmail(true);
    setSendNotification(true);
  };

  const handleBulkActions = async () => {
    setSaveProcess(true);
    confirmAlert({
      title: "Confirm",
      message: TASK_BULK_ACTION,
      buttons: [
        {
          label: "Yes",
          className: "btn btn-primary btn-lg",
          onClick: () => {
            const params = {};
            let selectedTaskData = taskList.filter(function (arr) {
              return arr.selected === true;
            });
            let taskIdsList = selectedTaskData.map((obj) => obj.id);
            params["taskids"] = taskIdsList.join();
            params["is_send_email"] = sendEmail === true ? 1 : 0;
            params["is_send_notification"] = sendNotification === true ? 1 : 0;
            params["mass_delete"] = 0;

            if (massDelete) {
              params["mass_delete"] = 1;
              params["stop_recurring_task"] = 0;
            }
            if (stopRecurringTask) {
              params["stop_recurring_task"] = 1;
              params["mass_delete"] = 0;
            } else {
              params["stop_recurring_task"] = 0;

              if (taskStatus !== 0) params["status"] = taskStatus;
              let assigned_members_list = selectedAssignedBy.map(
                (obj) => obj.id
              );
              if (assigned_members_list.join() !== "")
                params["assigned_members"] = assigned_members_list.join();
              let remove_assigned_members_list =
                selectedAssignedByForRemove.map((obj) => obj.id);
              if (remove_assigned_members_list.join() !== "")
                params["remove_assigned_members"] =
                  remove_assigned_members_list.join();
            }
            if (
              params?.mass_delete === 0 &&
              taskStatus === 0 &&
              params?.assigned_members === undefined &&
              params?.remove_assigned_members === undefined &&
              stopRecurringTask === 0
            ) {
              toast.error("Please select at least one action", {
                position: toast.POSITION.TOP_RIGHT,
              });
              setSaveProcess(false);
            } else {
              APIService.taskBulkAction(params)
                .then((response) => {
                  if (response.data?.status) {
                    cstSetCloseBulkActionModal();
                    setTimeout(() => {
                      toast.success(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT,
                      });
                    }, 200);
                    setSaveProcess(false);
                    setRefreshForNewPage(!refreshForNewPage);
                  } else {
                    toast.error(response.data?.message, {
                      position: toast.POSITION.TOP_RIGHT,
                    });
                    setSaveProcess(false);
                  }
                })
                .catch((error) => {
                  toast.error(error, {
                    position: toast.POSITION.TOP_RIGHT,
                  });
                  setSaveProcess(false);
                });
            }
          },
        },
        {
          label: "No",
          className: "btn btn-outline-secondary btn-lg",
          onClick: () => {
            setSaveProcess(false);
          },
        },
      ],
    });
  };

  const handleTaskStatus = async (e) => {
    setTaskStatus(e.id);
  };

  const handleAssignToSearch = (value) => {
    setAssignToSearch(value);
    filterDropdownOptionByName(staffList, value, setStaffListForFilter);
  };

  const onAssignBySelect = (e) => {
    handleAssignToSearch("");
    let id = parseInt(e);
    if (id > 0) {
      let addRemovechk =
        selectedAssignedBy.filter(function (arr) {
          return arr.id === id;
        }).length > 0;
      if (!addRemovechk) {
        let newstaffList = staffList.filter(function (arr) {
          return arr.id === id;
        });
        setSelectedAssignedBy(selectedAssignedBy.concat(newstaffList));
      } else {
        let newstaffList = selectedAssignedBy.filter(function (arr) {
          return arr.id !== id;
        });
        setSelectedAssignedBy(newstaffList);
      }
    }
  };

  const handleAssignToSearchForRemove = (value) => {
    setAssignToSearchForRemove(value);
    filterDropdownOptionByName(
      staffList,
      value,
      setStaffListForFilterForRemove
    );
  };

  const onAssignBySelectForRemove = (e) => {
    handleAssignToSearchForRemove("");
    let id = parseInt(e);
    if (id > 0) {
      let addRemovechk =
        selectedAssignedByForRemove.filter(function (arr) {
          return arr.id === id;
        }).length > 0;
      if (!addRemovechk) {
        let newstaffList = staffList.filter(function (arr) {
          return arr.id === id;
        });
        setSelectedAssignedByForRemove(
          selectedAssignedByForRemove.concat(newstaffList)
        );
      } else {
        let newstaffList = selectedAssignedByForRemove.filter(function (arr) {
          return arr.id !== id;
        });
        setSelectedAssignedByForRemove(newstaffList);
      }
    }
  };

  const SetTaskListIndex = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    result.map(function (value, index) {
      return (value.priority = index + 1);
    });
    return result;
  };

  const onDragEndDrop = (result) => {
    if (!result.destination) {
      return;
    }
    const taskListNew = SetTaskListIndex(
      taskList,
      result.source.index,
      result.destination.index
    );
    setTaskList(taskListNew);

    var priority_arr = taskListNew.map(function (value, index, array) {
      return value.id;
    });

    const params = new FormData();
    params.append("taskids", priority_arr);

    APIService.setTaskListPriority(params).then((response) => {
      if (response.data?.status) {
      } else {
        setTaskList(taskList);
      }
    });
  };

  const customStyles = {
    option: (styles, state) => ({
      ...styles,
      cursor: "pointer",
    }),
    control: (styles) => ({
      ...styles,
      cursor: "pointer",
    }),
  };

  return (
    <>
      {(userData?.role_code === databaseRoleCode.adminCode ||
        userData?.role_code === databaseRoleCode.pcCode) &&
      task_type !== 3 ? (
        <p className="bg-yellow-100 py-1 px-4 border border-yellow-200 rounded-5">
          <b>Note:</b> You will need to select agency from dropdown and also
          need to sort tasks table by Priority Order to be able to drag &amp;
          drop tasks. (To sort tasks table, please click on Priority Order
          column)
        </p>
      ) : (
        ""
      )}
      <DataTableWithPagination
        columns={columns}
        data={taskList}
        searchFilter={searchFilter}
        setSearchFilter={setSearchFilter}
        pageNumber={page}
        setPageNumber={setPage}
        perPageSize={perPageSize}
        setPerPageSize={setPerPageSize}
        loading={tableLoader}
        setSort={setSort}
        setSortingBy={setSortBy}
        totalPages={totalPages}
        totalRecords={totalRecords}
        isBulkAction={
          userData?.role_code === databaseRoleCode.adminCode ||
          userData?.role_code === databaseRoleCode.pcCode ||
          userData?.role_code === databaseRoleCode.agencyCode ||
          userData?.role_code === databaseRoleCode.agencyMemberCode
            ? true
            : false
        }
        handleBulkAction={handleBulkAction}
        exportData={exportData}
        isDragDropContext={showPriorityButton}
        onDragEndDrop={onDragEndDrop}
        customPrioritySorting={agency !== ""}
        customPrioritySortingSet={customPrioritySortingSet}
        isCheckboxChecked={isCheckboxChecked}
        lastOpenedTaskId={lastOpenedTaskId}
      />

      <Modal
        size="lg"
        show={showBulkActionModal}
        onHide={cstSetCloseBulkActionModal}
        centered
      >
        <Modal.Header closeButton className="py-5 px-10">
          <Modal.Title className="font-20 dark-1 mb-0">
            Bulk Actions
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="invite-people py-9 px-10">
            <Form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleBulkActions();
              }}
            >
              <Row className="g-4">
                {/* {userData?.role_code === databaseRoleCode.adminCode &&
                  !stopRecurringTask && (
                    <Col lg={6}>
                      <Form.Check
                        type="checkbox"
                        id="mass-delete"
                        label="Mass Delete"
                        value="1"
                        checked={massDelete}
                        onChange={(e) => {
                          setMassDelete(e.target.checked);
                        }}
                      />
                    </Col>
                  )} */}
                {/* {!massDelete && (
                  <Col lg={6}>
                    <Form.Check
                      type="checkbox"
                      id="stop-recurring-task"
                      label="Stop Recurring Tasks"
                      value="1"
                      checked={stopRecurringTask}
                      onChange={(e) => {
                        setStopRecurringTask(e.target.checked);
                      }}
                    />
                  </Col>
                )} */}
                {!stopRecurringTask && (
                  <Col lg={6}>
                    <Form.Check
                      type="checkbox"
                      id="send-email"
                      label="Send Email"
                      value="1"
                      checked={sendEmail}
                      onChange={(e) => {
                        setSendEmail(e.target.checked);
                      }}
                    />
                  </Col>
                )}
                {!stopRecurringTask && (
                  <Col lg={6}>
                    <Form.Check
                      type="checkbox"
                      id="send-notification"
                      label="Send Notification"
                      value="1"
                      checked={sendNotification}
                      onChange={(e) => {
                        setSendNotification(e.target.checked);
                      }}
                    />
                  </Col>
                )}
                {!massDelete && !stopRecurringTask && (
                  <>
                    <Col lg={6}>
                      <Form.Label className="form-label-sm">Status</Form.Label>
                      <Select
                        styles={customStyles}
                        className="custom-select"
                        options={taskStatusList}
                        onChange={handleTaskStatus}
                        value={taskStatusList.filter(function (option) {
                          return option.id === taskStatus;
                        })}
                      />
                    </Col>
                  </>
                )}
                {!massDelete && !stopRecurringTask && (
                  <>
                    {/* <Col lg={6}>
                                            <Form.Label className="form-label-sm">Priority</Form.Label>
                                            <Select options={taskPriorityList} onChange={handleTaskPriority}
                                                value={taskPriorityList.filter(function (option) {
                                                    return option.value === taskPriority;
                                                })} />
                                        </Col> */}
                    <Col lg={6}>
                      <Form.Label className="form-label-sm">
                        Assigned to
                      </Form.Label>
                      <div className="task-label-right">
                        <div className="avatar-group">
                          {selectedAssignedBy.map((assignUser, index) => (
                            <span
                              className="avatar avatar-md avatar-circle"
                              key={index}
                            >
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id={`tooltip-${index}`}>
                                    {" "}
                                    {assignUser.name}
                                  </Tooltip>
                                }
                              >
                                {assignUser.profile_image !== "" &&
                                assignUser.profile_image !== null ? (
                                  <img
                                    className="avatar-img"
                                    src={`${assignUser.profile_image}`}
                                    alt={assignUser.name}
                                    onError={({ currentTarget }) => {
                                      currentTarget.onerror = null;
                                      currentTarget.src = AvatarImg;
                                    }}
                                  />
                                ) : (
                                  <img
                                    className="avatar-img"
                                    src={AvatarImg}
                                    alt={assignUser.name}
                                  />
                                )}
                              </OverlayTrigger>
                            </span>
                          ))}

                          <span className="avatar avatar-md avatar-circle">
                            <Dropdown
                              className="project-drop-down category-dropdown "
                              onSelect={onAssignBySelect}
                              autoClose="outside"
                            >
                              <Dropdown.Toggle
                                as="a"
                                bsPrefix="no-toggle"
                                className="dark-2 font-weight-medium font-12 cursor-pointer"
                                id="assign"
                              >
                                <img
                                  alt="Add Member"
                                  className="avatar-img"
                                  src={AdddashedIcon}
                                />
                              </Dropdown.Toggle>
                              <Dropdown.Menu
                                as="ul"
                                align="down"
                                className="p-2 w-100"
                              >
                                <Dropdown.Header className="d-flex align-items-center pt-4 pb-3 pb-0 px-4">
                                  <div className="search-box w-100">
                                    <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                      <img src={SearchIcon} alt="Search" />
                                      <input
                                        type="search"
                                        className="form-control border-0"
                                        placeholder="Name"
                                        value={assignToSearch}
                                        onChange={(e) =>
                                          handleAssignToSearch(e.target.value)
                                        }
                                      />
                                    </div>
                                  </div>
                                </Dropdown.Header>
                                <SimpleBar className="dropdown-body">
                                  {staffListForFilter.map((drp, index) => (
                                    <Dropdown.Item
                                      as="li"
                                      key={index}
                                      eventKey={drp.id}
                                      className={`${
                                        selectedAssignedBy.filter(function (
                                          arr
                                        ) {
                                          return arr.id === drp.id;
                                        }).length > 0
                                          ? "active"
                                          : ""
                                      }`}
                                    >
                                      <div className="d-flex d-flex align-items-center cursor-pointer w-100">
                                        {drp.profile_image !== "" &&
                                        drp.profile_image !== null ? (
                                          <img
                                            className="avatar avatar-xs avatar-circle me-1"
                                            src={`${drp.profile_image}`}
                                            alt={drp.name}
                                            onError={({ currentTarget }) => {
                                              currentTarget.onerror = null;
                                              currentTarget.src = AvatarImg;
                                            }}
                                          />
                                        ) : (
                                          <img
                                            className="avatar avatar-xs avatar-circle me-1"
                                            src={AvatarImg}
                                            alt={drp.name}
                                          />
                                        )}
                                        <div className="ps-3">
                                          <div className="font-weight-regular dark-1 font-14 d-block">
                                            {drp.name}
                                          </div>
                                        </div>
                                      </div>
                                    </Dropdown.Item>
                                  ))}
                                </SimpleBar>
                              </Dropdown.Menu>
                            </Dropdown>
                          </span>
                        </div>
                      </div>
                    </Col>
                    <Col lg={6}>
                      <Form.Label className="form-label-sm">
                        Remove From Assigned to
                      </Form.Label>
                      <div className="task-label-right">
                        <div className="avatar-group">
                          {selectedAssignedByForRemove.map(
                            (assignUser, index) => (
                              <span
                                className="avatar avatar-md avatar-circle"
                                key={index}
                              >
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id={`tooltip-${index}`}>
                                      {" "}
                                      {assignUser.name}
                                    </Tooltip>
                                  }
                                >
                                  {assignUser.profile_image !== "" &&
                                  assignUser.profile_image !== null ? (
                                    <img
                                      className="avatar-img"
                                      src={`${assignUser.profile_image}`}
                                      alt={assignUser.name}
                                      onError={({ currentTarget }) => {
                                        currentTarget.onerror = null;
                                        currentTarget.src = AvatarImg;
                                      }}
                                    />
                                  ) : (
                                    <img
                                      className="avatar-img"
                                      src={AvatarImg}
                                      alt={assignUser.name}
                                    />
                                  )}
                                </OverlayTrigger>
                              </span>
                            )
                          )}

                          <span className="avatar avatar-md avatar-circle">
                            <Dropdown
                              className="project-drop-down category-dropdown "
                              onSelect={onAssignBySelectForRemove}
                              autoClose="outside"
                            >
                              <Dropdown.Toggle
                                as="a"
                                bsPrefix="no-toggle"
                                className="dark-2 font-weight-medium font-12 cursor-pointer"
                                id="assign"
                              >
                                <img
                                  alt="Add Member"
                                  className="avatar-img"
                                  src={AdddashedIcon}
                                />
                              </Dropdown.Toggle>
                              <Dropdown.Menu
                                as="ul"
                                align="down"
                                className="p-2 w-100"
                              >
                                <Dropdown.Header className="d-flex align-items-center pt-4 pb-3 pb-0 px-4">
                                  <div className="search-box w-100">
                                    <div className="input-group bg-white border border-gray-100 rounded-5 align-items-center w-100">
                                      <img src={SearchIcon} alt="Search" />
                                      <input
                                        type="search"
                                        className="form-control border-0"
                                        placeholder="Name"
                                        value={assignToSearchForRemove}
                                        onChange={(e) =>
                                          handleAssignToSearchForRemove(
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                </Dropdown.Header>
                                <SimpleBar className="dropdown-body">
                                  {staffListForFilterForRemove.map(
                                    (drp, index) => (
                                      <Dropdown.Item
                                        as="li"
                                        key={index}
                                        eventKey={drp.id}
                                        className={`${
                                          selectedAssignedByForRemove.filter(
                                            function (arr) {
                                              return arr.id === drp.id;
                                            }
                                          ).length > 0
                                            ? "active"
                                            : ""
                                        }`}
                                      >
                                        <div className="d-flex d-flex align-items-center cursor-pointer w-100">
                                          {drp.profile_image !== "" &&
                                          drp.profile_image !== null ? (
                                            <img
                                              className="avatar avatar-xs avatar-circle me-1"
                                              src={`${drp.profile_image}`}
                                              alt={drp.name}
                                              onError={({ currentTarget }) => {
                                                currentTarget.onerror = null;
                                                currentTarget.src = AvatarImg;
                                              }}
                                            />
                                          ) : (
                                            <img
                                              className="avatar avatar-xs avatar-circle me-1"
                                              src={AvatarImg}
                                              alt={drp.name}
                                            />
                                          )}
                                          <div className="ps-3">
                                            <div className="font-weight-regular dark-1 font-14 d-block">
                                              {drp.name}
                                            </div>
                                          </div>
                                        </div>
                                      </Dropdown.Item>
                                    )
                                  )}
                                </SimpleBar>
                              </Dropdown.Menu>
                            </Dropdown>
                          </span>
                        </div>
                      </div>
                    </Col>
                  </>
                )}

                <Col lg={12} className="text-end">
                  <Button
                    variant="soft-secondary"
                    size="md"
                    type="button"
                    onClick={cstSetCloseBulkActionModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={saveProcess}
                    variant="primary ms-3"
                    size="md"
                    type="submit"
                  >
                    {!saveProcess && "Confirm"}
                    {saveProcess && (
                      <>
                        <Spinner
                          size="sm"
                          animation="border"
                          className="me-1"
                        />
                        Confirm
                      </>
                    )}
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={showPublishModal}
        onHide={() => setShowPublishModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Enter URL for Publishing</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="publishUrl">
              <Form.Label>URL</Form.Label>
              <Form.Control
                type="url"
                placeholder="Enter URL"
                value={publishUrl}
                onChange={(e) => setPublishUrl(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPublishModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePublish}>
            Publish
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

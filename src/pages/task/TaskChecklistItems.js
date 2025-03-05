import React, { useState, useEffect } from 'react';
import APIService from "../../api/APIService";
import { toast } from 'react-toastify';
import { Form, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { check } from "../../utils/functions.js";
import { databaseRoleCode } from '../../settings';
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import MoveIcon from "../../assets/img/icons/move.svg";
import AvatarImg from "../../assets/img/placeholder-image.png";

export default function TaskChecklistItems({ userData, checkList, setCheckList, addCheckListItemProcess, setAddCheckListItemProcess, fetchCheckList, taskId }) {
    const [reloadCheckList, setReloadCheckList] = useState(false);
    useEffect(() => {
    }, [reloadCheckList]);

    const addCheckListItem = () => {
        setAddCheckListItemProcess(true);
        if (document.getElementById(`checklist-input-0`)) {
            document.getElementById(`checklist-input-0`).blur();
        }
        let params = {};
        params["taskid"] = taskId;
        params["description"] = '';
        APIService.addChecklist(params)
            .then((response) => {
                if (response.data?.status) {
                    fetchCheckList(1);
                }
                else {
                    toast.error(response.data?.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            });
    };

    const SetStaffListIndex = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
    
        return result;
      };

    const onDragEndDrop = (result) => {
        if (!result.destination) {
            return;
        }
        const ListNew = SetStaffListIndex(
            checkList,
            result.source.index,
            result.destination.index
        );
        setCheckList(ListNew);

        var priority_arr = ListNew.map(function (value) {
            return value.id;
        });

        const params = new FormData();
        params.append("ids", priority_arr);

        APIService.updateChecklistPriority(params)
            .then((response) => {
                /*if (response.data?.status) {
                  setReloadTaskboard(!reloadTaskboard);
                }
                else {
                  SetStaffForManage(staffForManage);
                }*/
            });
    }

    const deleteTaskCheckList = (id, description, index) => {
        document.getElementById(`btn-subtask-${index}`).disabled = true;
        let params = {};
        params["id"] = id;
        APIService.deleteTaskCheckList(params)
            .then((response) => {
                if (response.data?.status) {
                    fetchCheckList(0);
                    if (description !== '') {
                        toast.success(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                    document.getElementById(`checklist-input-${index}`).blur();
                    setTimeout(() => {
                        document.getElementById(`btn-subtask-${index}`).disabled = false;
                    }, 500);
                }
                else {
                    if (description !== '') {
                        toast.error(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                }
            });
    }

    const onBlurDeleteTaskCheckList = (val, list) => {
        if (val === '') {
            let params = {};
            params["id"] = list.id;
            APIService.deleteTaskCheckList(params)
                .then((response) => {
                    fetchCheckList(0);
                    document.getElementById("checklist-input-0").blur();
                });
        }
    }

    const updateChecklist = (checked, description, list, checkboxChange) => {
        let tempList = checkList;
        tempList.forEach(item => {
          if (list.id === item.id) {
            item.finished = checked ? 1 : 0;
            item.description = description;
          }
        });
        setCheckList(tempList);
        setReloadCheckList(!reloadCheckList);
    
        let params = {};
        params["id"] = list.id;
        params["taskid"] = list.taskid;
        params["description"] = description;
        params["done"] = checked ? 1 : 0;
        APIService.updateChecklist(params)
          .then((response) => {
            if (response.data?.status) {
              if (checkboxChange) {
                fetchCheckList(0);
              }
            }
            else {
              toast.error(response.data?.message, {
                position: toast.POSITION.TOP_RIGHT
              });
            }
          });
      };

    return (
        <div className='add-sub-task mt-7'>
            {/* <span className="font-14 font-weight-semibold dark-1 d-inline-block mb-4">Checklist Items</span>
            <button type="button" className="btn btn-outline-secondary btn-sm ms-2" onClick={addCheckListItem} disabled={addCheckListItemProcess}>
                {addCheckListItemProcess ?
                    <Spinner size="sm" animation="border" />
                    :
                    <i className="icon-add"></i>
                }
                <span className="ms-2"> Add subtask</span>
            </button> */}
            <DragDropContext onDragEnd={onDragEndDrop}>
                <div className='manage-staff-sidebar'>
                    <Droppable droppableId="droppable">
                        {(provided, snapshot) => (
                            <div className="staff-list" ref={provided.innerRef} {...provided.droppableProps}>
                                {checkList?.map((list, list_index) => (
                                    <Draggable draggableId={`${list_index}`} key={list_index} index={list_index}>
                                        {(provided) => (
                                            <div className="staff-detail border border-gray-100 rounded-6" ref={provided.innerRef} {...provided.draggableProps} key={list_index}>
                                                <div className="move-cell" {...provided.dragHandleProps}><div className="move-icon"><img src={MoveIcon} alt="Drop" /></div></div>
                                                <Form.Check className='mb-0 check-round check-green' id={`check-list-${list_index}`} type="checkbox" label="" value="1" checked={list?.finished === 1} onChange={(e) => { updateChecklist(e.target.checked, list.description, list, true) }} />
                                                <span className='flex-1 me-4'>
                                                    <Form onSubmit={async e => { e.preventDefault(); await addCheckListItem() }}>
                                                        <input type="text" className={`form-control border-0 p-0 w-100 ${list.finished === 1 ? 'text-decoration-line-through' : ''}`} id={`checklist-input-${list_index}`} value={list.description} onChange={(e) => { updateChecklist(list.finished, e.target.value, list, false) }} disabled={check(['tasks.update'], userData?.role.getPermissions) !== true} onBlur={(e) => { onBlurDeleteTaskCheckList(e.target.value, list) }} />
                                                    </Form>
                                                </span>

                                                <div className='create-completed d-flex align-itmes-center ms-auto'>
                                                    {list?.name !== '' &&
                                                        <div className='created-by-block mx-1'>
                                                            <div className="avatar-group">
                                                                <span className="avatar avatar-sm avatar-circle" >
                                                                    <Link to={`/user-detail/${list.addedfrom}`} target='_blank'>
                                                                        <OverlayTrigger placement="top" overlay={<Tooltip> Created by: {list?.name}</Tooltip>}>
                                                                            {list?.added_from_image !== '' && list?.added_from_image !== null ?
                                                                                <img className="avatar-img border-secondary" src={`${list?.added_from_image}`} alt={list?.name} onError={({ currentTarget }) => {
                                                                                    currentTarget.onerror = null;
                                                                                    currentTarget.src = AvatarImg;
                                                                                }} />
                                                                                :
                                                                                <img className="avatar-img border-secondary" src={AvatarImg} alt={list?.name} />
                                                                            }
                                                                        </OverlayTrigger>
                                                                    </Link>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    }
                                                    {list?.finished_name !== '' &&
                                                        <div className='completed-by-block mx-1 me-2'>
                                                            <div className="avatar-group">
                                                                <span className="avatar avatar-sm avatar-circle" >
                                                                    <Link to={`/user-detail/${list.finished_from}`} target='_blank'>
                                                                        <OverlayTrigger placement="top" overlay={<Tooltip> Completed by: {list?.finished_name}</Tooltip>}>
                                                                            {list?.finished_from_image !== '' && list?.finished_from_image !== null ?
                                                                                <img className="avatar-img border-success" src={`${list?.finished_from_image}`} alt={list?.finished_name} onError={({ currentTarget }) => {
                                                                                    currentTarget.onerror = null;
                                                                                    currentTarget.src = AvatarImg;
                                                                                }} />
                                                                                :
                                                                                <img className="avatar-img border-success" src={AvatarImg} alt={list?.finished_name} />
                                                                            }
                                                                        </OverlayTrigger>
                                                                    </Link>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    }
                                                    {(check(['tasks.delete'], userData?.role.getPermissions) && list?.addedfrom === userData?.id) || userData?.role_code === databaseRoleCode.adminCode ?
                                                        <button type="button" id={`btn-subtask-${list_index}`} className="btn-icon circle-btn btn btn-white btn-sm" onClick={() => { deleteTaskCheckList(list?.id, list?.description, list_index); }}>
                                                            <i className="icon-delete text-danger"></i>
                                                        </button>
                                                        : ''
                                                    }
                                                </div>

                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                            </div>
                        )}
                    </Droppable>
                </div>
            </DragDropContext>
        </div>
    );
}

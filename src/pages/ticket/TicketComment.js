import React, { useState, useEffect } from 'react';
import LastSeen from "../../modules/custom/LastSeen";
import AvatarImg from "../../assets/img/placeholder-image.png";
import { Link, useLocation } from "react-router-dom";
import { appHappyText, replaceSpecialCharacters } from "../../utils/functions.js";
import { databaseRoleCode, tinymceInit, office_display_date_format_with_time } from '../../settings';
import moment from 'moment-timezone';
import { Button, Spinner, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Editor } from "@tinymce/tinymce-react";
import { toast } from 'react-toastify';
import APIService from "../../api/APIService";
import { validateForm } from "../../utils/validator.js";
import linkifyHtml from 'linkify-html';
import { TicketCommentValidator } from "../../modules/validation/TicketSystemValidator";
import { format } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const REACT_APP_TINYMCE_APIKEY = process.env.REACT_APP_TINYMCE_APIKEY;

export default function TicketComment({ comment, userData, handleDeleteTicketComment, setRefreshComment, refreshComment }) {
    const searchHash = useLocation().hash;
    const [isEditing, setIsEditing] = useState(false);
    const [commentFormErrors, setCommentFormErrors] = useState([]);
    const [processEdit, setProcessEdit] = useState(false);
    const onEditorChange = (e) => {
        setHtmlContent(e);
    }

    const [htmlContent, setHtmlContent] = useState(comment?.content);

    const editTicketComment = () => {
        setProcessEdit(true);
        setCommentFormErrors([]);
        let validate = validateForm((TicketCommentValidator(htmlContent ? htmlContent : '')));
        if (Object.keys(validate).length) {
            setProcessEdit(false);
            setCommentFormErrors(validate);
        }
        else {
            const params = new FormData();
            params.append("commentid", comment.id);
            params.append("content", htmlContent ? htmlContent : '');

            APIService.updateTicketComment(params)
                .then((response) => {
                    if (response.data?.status) {
                        toast.success(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setProcessEdit(false);
                        setRefreshComment(!refreshComment);
                        setIsEditing(false);
                    }
                    else {
                        toast.error(response.data?.message, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setProcessEdit(false);
                    }
                })
                .catch((error) => {
                    toast.error(error, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                    setProcessEdit(false);
                });
        }
    };

    useEffect(() => {
        setIsEditing(false);
        if (searchHash) {
            setTimeout(() => {
                const element = document.getElementById(searchHash.replaceAll("#", ''));
                element.scrollIntoView();
            }, 500);
        }
    }, [comment]);

    return (
        <>
            <div className="d-flex w-100">
                <div className="comments-icon">
                    {comment.profile_image !== '' && comment.profile_image !== null ?
                        <img className="avatar-img" src={`${comment.profile_image}`} alt={comment.name} onError={({ currentTarget }) => {
                            currentTarget.onerror = null;
                            currentTarget.src = AvatarImg;
                        }} />
                        :
                        <img className="avatar-img" src={AvatarImg} alt={comment.name} />
                    }
                </div>
                <div className="comments-detail ms-3">
                    <div className="comments-header d-flex align-items-md-center">
                        <div className="d-flex flex-md-row flex-column align-items-md-center">
                            <Link to={`/user-detail/${comment.staff_id}`} className="commnets-name font-weight-medium text-nowrap">{comment.name}</Link>
                            <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-${comment.id}`}> 
                            {format(new Date(comment.created_at), office_display_date_format_with_time)}
                            </Tooltip>}>
                                <a href={`#comment_${comment.id}`} className="commnets-time dark-2 ms-md-2 font-12 mt-1 text-nowrap d-md-inline-block d-block">
                                    <LastSeen date={Date.parse(moment(comment.created_at).format())} />
                                </a>
                            </OverlayTrigger>
                        </div>
                        <div className="d-flex align-items-md-center ms-auto">
                            {userData.role_code === databaseRoleCode.adminCode || userData?.id === comment.staff_id ?
                                <>
                                    {!isEditing &&
                                        <Button size='sm' className='ms-4 btn-icon circle-btn text-primary' variant="white" onClick={() => { setIsEditing(true) }}><i className="icon-edit"></i></Button>}
                                    <Button size='sm' className='ms-2 btn-icon circle-btn text-danger' variant="white" onClick={() => { handleDeleteTicketComment(comment.id); setIsEditing(false); }}><i className="icon-delete"></i></Button>
                                </>
                                : ''}
                        </div>
                    </div>
                    <div className="comments-body pt-3">
                        {!isEditing && comment?.content && comment?.content !== '[task_attachment]' && <p dangerouslySetInnerHTML={{ __html: replaceSpecialCharacters(linkifyHtml(appHappyText(comment?.content))).replaceAll('[task_attachment]', '').replaceAll("<a ", "<a rel='nofollow' target='_blank' ") }}></p>}
                        {isEditing &&
                            <div className='mt-4 mb-4'>
                                <Form onSubmit={async e => { e.preventDefault(); await editTicketComment() }}>
                                    {/* <Editor
                                        apiKey={REACT_APP_TINYMCE_APIKEY}
                                        //initialValue=""
                                        value={htmlContent}
                                        init={tinymceInit}
                                        onEditorChange={onEditorChange}
                                    /> */}
                                    <ReactQuill theme="snow" value={htmlContent} onChange={setHtmlContent} />
                                    {commentFormErrors.commentInput && (
                                        <span className="text-danger">{commentFormErrors.commentInput}</span>
                                    )}
                                    <div className='mt-4'>
                                        <Button className="me-2" variant="soft-secondary" size="md" type="button" onClick={() => { setIsEditing(false) }}>Cancel</Button>
                                        <Button disabled={processEdit} variant="primary" size="md" type="submit">
                                            {
                                                !processEdit && 'Save'
                                            }
                                            {
                                                processEdit && <><Spinner size="sm" animation="border" className="me-1" />Save</>
                                            }
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </>
    );
}

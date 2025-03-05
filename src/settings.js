import APIService from "./api/APIService";
import { toast } from 'react-toastify';

const tinymceSetup = (editor) => {
    editor.on('Drop paste', (e) => {

        if (e.type === 'drop' && !e.dataTransfer) return;

        if ((e?.dataTransfer?.items?.length > 1 && e?.dataTransfer?.items[0]?.kind === 'file') || (e?.clipboardData?.items?.length > 1 && e?.clipboardData?.items[0]?.kind === 'file')) {
            e.preventDefault();
            toast.error('Please upload only one image and try again.', {
                position: toast.POSITION.TOP_RIGHT
            }); return;
        }

        e.preventDefault();

        const file = e.type === 'drop' ? e.dataTransfer.files[0] : e.clipboardData.items[0].getAsFile();
        
        if (file) {
            // Create loader element
            const loader = document.createElement('div');
            loader.classList.add('loader');
            document.body.appendChild(loader);

            resizeAndCompressImage(file, function (imageUrl) {
                // Once the image is uploaded, insert it into the editor
                setTimeout(() => {
                    editor.insertContent('<img src="' + imageUrl + '" alt=""/>');                    
                    loader.remove();
                }, 900); 
            });      
        }else{            
            const content = e.clipboardData.getData('text/html');
            const plainText = e.clipboardData.getData('text/plain');
            setTimeout(() => {   
                if (content) {
                    const sanitizedHTML = content.replace(/(<[^>]+) style=".*?"/gi, '$1');

                    editor.insertContent(sanitizedHTML, { merge: true });
                }else{
                    const formattedText = plainText.replace(/\n/g, '<br>');
                    editor.insertContent(formattedText);
                }
            }, 30); 
        }  
    
        
    });
};


function uploadToS3(file, callback) {
    const params = new FormData();
    params.append("image", file);

        APIService.getEditorAddAndUpdateImageUrl(params)
        .then((response) => {
            if (response.data?.status) {
                let data = response.data?.data;
                const imageUrl = data;                
                callback(imageUrl);
            }
        })
        .catch((error) => {

        });
}

function resizeAndCompressImage(file, callback) {
    const maxWidth = 400; // Set your desired maximum width here
    const maxHeight = 400; // Set your desired maximum height here
    const quality = 0.6; // Set desired quality (0.1 - 1.0)

    const img = document.createElement('img');
    const reader = new FileReader();

    reader.onload = function (event) {
        img.src = event.target.result;

        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {

                if (width > height) {
                    height *= maxWidth / width;
                    width = maxWidth;
                } else {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
           
            canvas.toBlob((blob) => {

                let pngFile = new File([blob], file.name, { type: 'image/png' });               
                uploadToS3(pngFile, callback);

            }, 'image/png', quality);
        };
    };

    reader.readAsDataURL(file);
}

const settings = {
    app_timezone: 'America/New_York',
    super_admin: 'Admin',
    date_format: "MM-dd-yyyy",
    indian_date_format: "dd-MM-yyyy",
    date_format_placeholderText: "MM-DD-YYYY",
    indian_date_format_placeholderText: "DD-MM-YYYY",
    date_range_format_placeholderText: "MM-DD-YYYY - MM-DD-YYYY",
    indian_date_range_format_placeholderText: "DD-MM-YYYY - DD-MM-YYYY",
    display_date_format: "MM-DD-YYYY",
    display_date_format_india: "DD-MM-YYYY",
    display_date_format_with_time: "MM-DD-YYYY hh:mm A",
    display_date_format_with_time_india: "yyyy-MM-dd hh:mm a",
    display_date_format_with_time_indian: "dd-MM-yyyy hh:mm a",
    subscription_display_date_format: "MMM DD YYYY",
    office_display_date_format: "dd MMM yyyy",
    office_display_date_format_for_date: "DD MMM yyyy",
    office_display_date_format_with_time: "dd MMM yyyy hh:mm a",
    subscription_list_display_date_format: "MMM DD",
    pagination: {
        perPageRecord: 10, // default size
        sorting: 'desc', // default sorting
        perPageRecordForUser: 100,
        perPageRecordForCustomer: 25,
        perPageRecordDatatable: 20,
        perPageRecordForLeave: 100,
        perPageRecordForComment: 7,
    },
    repeatEveryListData: [
        {
            value: '1 week',
            label: '1 Week'
        },
        {
            value: '2 week',
            label: '2 Week'
        }, {
            value: '1 month',
            label: '1 Month'
        }, {
            value: '2 month',
            label: '2 Month'
        }, {
            value: '3 month',
            label: '3 Month'
        }, {
            value: '6 month',
            label: '6 Month'
        }, {
            value: '1 year',
            label: '1 Year'
        }, {
            value: 'custom',
            label: 'Custom'
        }
    ],
    repeatEveryCustomListData: [
        {
            value: 'day',
            label: 'Day'
        }, {
            value: 'week',
            label: 'Week'
        }, {
            value: 'month',
            label: 'Month'
        }, {
            value: 'year',
            label: 'Year'
        }
    ],
    hearAboutUsList: [
        {
            value: '',
            label: 'Select'
        }, {
            value: 'Google Search',
            label: 'Google Search'
        }, {
            value: 'Google ads',
            label: 'Google ads'
        }, {
            value: 'FB ads',
            label: 'FB ads'
        }, {
            value: 'Youtube',
            label: 'Youtube'
        }, {
            value: 'UGURUS',
            label: 'UGURUS'
        }, {
            value: 'WP Mayor Blog',
            label: 'WP Mayor Blog'
        }, {
            value: 'Geekflare Blog',
            label: 'Geekflare Blog'
        }, {
            value: 'Affiliates',
            label: 'Affiliates'
        }, {
            value: 'Other',
            label: 'Other'
        }
    ],
    attachmentsAllowExtension: ["png", "jpeg", "jpg", "gif", "zip", "pdf", "doc", "docx", "xlsx", "xls", 'svg', "csv"],
    attachmentsAllowExtensionMsg: "file type should be .png, .jpeg, .jpg, .gif, .zip, .pdf, .doc, .docx, .xlsx, .xls, .svg, .csv",
    databaseRoleCode: {
        adminCode: "admin",
        agencyCode: "agency_owner",
        pcCode: "pc",
        accountantCode: "accountant",
        clientCode: "client",
        employeeCode: "employee",
        agencyMemberCode: "agency_member",
        hrCode: "hr",
        teamLeadCode: "team_lead",
        projectManageAiCode: "project_manager_ai"
    },
    leaveStatusList: [
        {
            value: 1,
            label: 'Pending'
        },
        {
            value: 2,
            label: 'Approved'
        }, {
            value: 3,
            label: 'Disapproved'
        }
    ],
    taskboardClientHappyStatus: [
        {
            value: 'happy',
            label: 'Happy'
        },
        {
            value: 'unhappy',
            label: 'Unhappy'
        }, {
            value: 'angry',
            label: 'Angry'
        }
    ],
    popperConfig: {
        strategy: "fixed",
        onFirstUpdate: () => window.dispatchEvent(new CustomEvent('scroll')),
    },
    taskPriorityList: [
        {
            value: 1,
            label: 'Low'
        },
        {
            value: 2,
            label: 'Medium'
        }, {
            value: 3,
            label: 'High'
        }, {
            value: 4,
            label: 'Urgent'
        }
    ],
    quarterList: [
        {
            value: '1',
            label: '1'
        }, {
            value: '2',
            label: '2'
        }, {
            value: '3',
            label: '3'
        }, {
            value: '4',
            label: '4'
        }
    ],
    tinymceInit: {
        branding: false,
        height: 300,
        browser_spellcheck: true,
        verify_html: false,
        cleanup: false,
        valid_elements: '+*[*]',
        valid_children: "+body[style], +style[type]",
        apply_source_formatting: false,
        remove_script_host: false,
        //removed_menuitems: 'newdocument restoredraft print preview',
        forced_root_block: false,
        autosave_restore_when_empty: false,
        fontsize_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
        menubar: false,
        //menubar: 'file edit insert view format table tools help',
        plugins:
            "autosave print preview paste searchreplace autolink directionality visualblocks visualchars code fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor insertdatetime advlist lists wordcount textpattern",
        toolbar:
            "fontselect fontsizeselect formatselect | forecolor backcolor | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | numlist bullist | outdent indent | image link media | removeformat | table",
        image_advtab: true,
        paste_data_images: true,
        paste_auto_cleanup_on_paste: true,
        paste_convert_middot_lists: true,
        paste_remove_styles: true,
        paste_remove_styles_if_webkit: true,
        paste_strip_class_attributes: true,
        block_unsupported_drop: false,
        autosave_ask_before_unload: false,
        setup: tinymceSetup
    },
    monthList: [
        {
            value: 0,
            label: 'All Months'
        }, {
            value: 1,
            label: 'January'
        }, {
            value: 2,
            label: 'February'
        }, {
            value: 3,
            label: 'March'
        }, {
            value: 4,
            label: 'April'
        }, {
            value: 5,
            label: 'May'
        }, {
            value: 6,
            label: 'June'
        }, {
            value: 7,
            label: 'July'
        }, {
            value: 8,
            label: 'August'
        }, {
            value: 9,
            label: 'September'
        }, {
            value: 10,
            label: 'October'
        }, {
            value: 11,
            label: 'November'
        }, {
            value: 12,
            label: 'December'
        }
    ],
    backendDeveloperId: "3",
    frontendDeveloperId: "4",
    seoDeveloperId: "19",
    pcHeadId: "18",
    ticketPriorityList: [
        {
            value: 'High',
            label: 'High'
        },
        {
            value: 'Medium',
            label: 'Medium'
        }, {
            value: 'Low',
            label: 'Low'
        }
    ],
    workingDayOption: [
        {
            value: 'full_day',
            label: 'Full Day',
        },
        {
            value: 'half_day',
            label: 'Half Day'
        }
    ],
    thresholdStatusDateLimit: "14",
    hrStaffId: 583,
    globalSearchAllowedPaths: [
        '/tasks',
        '/topics',
        '/view-task/',
        '/edit-task/',
        '/site-addons-tasks',
        '/view-site-addons-task/',
        '/edit-site-addons-task/',
        '/favourite-tasks',
        '/view-favourite-task/',
        '/edit-favourite-task/',
        '/projects',
        '/project-detail',
        '/edit-project/'
    ],
    workReportDeadlineMatchList: [
        {
            value: 'On Time',
            label: 'On Time'
        },
        {
            value: 'Delayed',
            label: 'Delayed'
        }
    ],
    workReportReasonList: [
        {
            value: 'Task Complexity',
            label: 'Task Complexity'
        },
        {
            value: 'Not given proper hours',
            label: 'Not given proper hours'
        },
        {
            value: 'New requirements by client',
            label: 'New requirements by client'
        }
    ],
    ResourceAllocationEditAccessIds: [2, 750],
    designationExcludeList: ['QA', 'Custom QA'],
    taskStatusList: [
        {
            value: 'Testing',
            label: 'Testing'
        },
        {
            value: 'Awaiting Feedback',
            label: 'Awaiting Feedback'
        },
        {
            value: 'In Progress',
            label: 'In Progress'
        },
        {
            value: 'Not Started',
            label: 'Not Started'
        },
        {
            value: 'Hold',
            label: 'Hold'
        },
        {
            value: 'Completed',
            label: 'Completed'
        },
        {
            value: 'Pending Approval', // New status added
            label: 'Pending Approval' // New label
        }
    ],
    allowedUserIds: [11, 832, 12, 917, 804, 829, 643, 728, 41, 838, 789, 5, 583, 198, 464, 453, 614, 837, 25, 10, 141, 1, 3]
}

export const {
    super_admin,
    app_timezone,
    date_format,
    indian_date_format,
    date_format_placeholderText,
    indian_date_format_placeholderText,
    date_range_format_placeholderText,
    indian_date_range_format_placeholderText,
    display_date_format,
    display_date_format_india,
    subscription_display_date_format,
    office_display_date_format,
    office_display_date_format_for_date,
    office_display_date_format_with_time,
    subscription_list_display_date_format,
    pagination,
    repeatEveryListData,
    repeatEveryCustomListData,
    attachmentsAllowExtension,
    attachmentsAllowExtensionMsg,
    databaseRoleCode,
    hearAboutUsList,
    leaveStatusList,
    taskboardClientHappyStatus,
    popperConfig,
    taskPriorityList,
    editorToolbar,
    display_date_format_with_time,
    display_date_format_with_time_india,
    display_date_format_with_time_indian,
    quarterList,
    tinymceInit,
    monthList,
    backendDeveloperId,
    frontendDeveloperId,
    seoDeveloperId,
    ticketPriorityList,
    workingDayOption,
    pcHeadId,
    thresholdStatusDateLimit,
    globalSearchAllowedPaths,
    workReportDeadlineMatchList,
    workReportReasonList,
    hrStaffId,
    ResourceAllocationEditAccessIds,
    designationExcludeList,
    taskStatusList,
    allowedUserIds
} = settings

import { Buffer } from 'buffer';
import moment from 'moment';

let preFixToken = "eyAJhbGciOiJIUzI1NBiIsInR5cCI6IkpXVCJ9C";
let postFixToken = "WIALGgfctOBlV1200RyZBcENyggr9fSnDypUY9";

export const encryptToken = (token) => {
    let newToken = preFixToken + token + postFixToken;
    let buff = new Buffer(newToken);
    return buff.toString('base64');
}

export const decryptToken = (token) => {
    let buff1 = new Buffer(token, 'base64');
    let newToken = buff1.toString('ascii').replace(preFixToken, '').replace(postFixToken, '');
    return newToken;
}


export const check = (required, has) => {
    if (required instanceof Array && required.length > 0 && has instanceof Array && has.length > 0) {
        return has.some(permission => {
            return required.includes(permission);
        });
    } else {
        return false;
    }
};

export const capitalizeFirst = str => {
    if (str)
        return str.charAt(0).toUpperCase() + str.slice(1);
    else
        return '';
};

export const capitalizeFirstWithRemoveUnderScore = str => {
    str = str.replaceAll('_', ' ');
    if (str) {
        const words = str.split(" ");
        for (let i = 0; i < words.length; i++) {
            if(words[i] != ''){
                words[i] = words[i][0].toUpperCase() + words[i].substr(1);
            }
        }
        return words.join(" ");
    }
    else {
        return '';
    }
};

export const capitalizeForRepeatEvery = str => {
    if (str) {
        const arr = str.split(" ");
        for (var i = 0; i < arr.length; i++) {
            arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
        }
        return arr.join(" ");
    }
    else {
        return '';
    }
};


export const filterDropdownOption = async (list, searchText, setList) => {
    if (searchText !== '' && searchText !== null) {
        let newList = list.filter(function (option) {
            return option.label.toLowerCase().startsWith(searchText.toLowerCase());
        });

        setList(newList);
    }
    else {
        setList(list);
    }
};

export const filterDropdownOptionByName = async (list, searchText, setList) => {
    if (searchText !== '' && searchText !== null) {
        let newList = list.filter(function (option) {
            //return option.name.toLowerCase().startsWith(searchText.toLowerCase());
            return option.name.toLowerCase().includes(searchText.toLowerCase());
        });

        setList(newList);
    }
    else {
        setList(list);
    }
};

export const filterDropdownOptionByAgencyName = async (list, searchText, setList) => {
    if (searchText !== '' && searchText !== null) {
        let newList = list.filter(function (option) {
            return option.agency_name?.toLowerCase().includes(searchText.toLowerCase());
        });

        setList(newList);
    }
    else {
        setList(list);
    }
};

export const removeArrayByAttr = (arr, attr, value) => {
    var i = arr.length;
    while (i--) {
        if (arr[i]
            && arr[i].hasOwnProperty(attr)
            && (arr[i][attr] === value)) {

            arr.splice(i, 1);

        }
    }
    return arr;
}

export const monthList = [
    {
        label: 'January',
        value: '1',
    },
    {
        label: 'February',
        value: '2',
    },
    {
        label: 'March',
        value: '3',
    },
    {
        label: 'April',
        value: '4',
    },
    {
        label: 'May',
        value: '5',
    },
    {
        label: 'June',
        value: '6',
    },
    {
        label: 'July',
        value: '7',
    },
    {
        label: 'August',
        value: '8',
    },
    {
        label: 'September',
        value: '9',
    },
    {
        label: 'October',
        value: '10',
    },
    {
        label: 'November',
        value: '11',
    },
    {
        label: 'December',
        value: '12',
    }
];

export const padZero = (number, count = 2) => number.toString().padStart(count, "0")

export function isDate(txtDate) {
    const currVal = txtDate;
    if (currVal === '')
        return false;
    const rxDatePattern = /^(\d{1,2})(\/|-)(\d{1,2})(\/|-)(\d{4})$/; //Declare Regex
    const dtArray = rxDatePattern.test(currVal); // is format OK?
    if (dtArray === null)
        return false;
    //Checks for mm/dd/yyyy format.
    const dtMonth = dtArray[1];
    const dtDay = dtArray[3];
    const dtYear = dtArray[5];
    const current_year = new Date().getFullYear();
    const newyear = current_year - dtYear;
    if (dtMonth < 1 || dtMonth > 12)
        return false;
    else if (dtDay < 1 || dtDay > 31)
        return false;
    else if ((dtMonth === 4 || dtMonth === 6 || dtMonth === 9 || dtMonth === 11) && dtDay === 31)
        return false;
    else if (dtMonth === 2) {
        const isleap = (dtYear % 4 === 0 && (dtYear % 100 !== 0 || dtYear % 400 === 0));
        if (dtDay > 29 || (dtDay === 29 && !isleap))
            return false;
    } else if (newyear < 21) {
        return 21;
    }
    return true;
}

export const getProjectStatusClass = (status_id) => {
    switch (status_id) {
        case 0:
            return "avatar-info";
        case 1:
            return "avatar-info";
        case 2:
            return "avatar-primary";
        case 3:
            return "avatar-danger";
        case 5:
            return "avatar-danger";
        case 4:
            return "avatar-success";
        default:
            return true;
    }
}

export const formatDate = (date_string) => {
    if (!date_string)
        return '-';
    const date = moment(date_string);
    return padZero(date.month() + 1) + '/' + padZero(date.date()) + '/' + date.year();
}

export const formatTime = (timestamp) => {
    if (!timestamp)
        return '-';
    const date = moment(timestamp);
    return padZero(date.hours()) + ':' + padZero(date.minutes());
}

export const formatMonthDate = (date_string) => {
    if (!date_string)
        return '-';
    const date = moment(date_string);
    return monthList[date.month()]['label'] + '-' + date.year();
}

export const getFileExtensionFromFileName = (filename) => {
    return filename.substr(filename.lastIndexOf('.') + 1);
}

export const getLeaveIcons = (leave_type) => {
    if (leave_type === 'SL')
        return <span className="badge badge-size-xl rounded-24 py-2 bg-red-50 text-danger"><i className="icon-face-mask"></i></span>;
    else if (leave_type === 'CL')
        return <span className="badge badge-size-xl rounded-24 py-2 bg-cyan-50 text-info"><i className="icon-person-to-door"></i></span>;
    else if (leave_type === 'PL')
        return <span className="badge badge-size-xl rounded-24 py-2 bg-yellow-50 text-orange"><i className="icon-clipboard-list-check"></i></span>;
    else if (leave_type === 'COMPOFF')
        return <span className="badge badge-size-xl rounded-24 py-2 bg-pink-50 text-pink"><i className="icon-chalkboard-user"></i></span>;
    else
        return <span className="badge badge-size-xl rounded-24 py-2  bg-blue-50 text-primary"><i className="icon-receipt"></i></span>;
}

export const getLeaveStatus = (leave_type) => {
    if (leave_type === 1)
        return <span className="badge badge-sm badge-warning font-weight-semibold font-12">Pending</span>;
    else if (leave_type === 2)
        return <span className="badge badge-sm badge-success font-weight-semibold font-12">Approved</span>;
    else if (leave_type === 3)
        return <span className="badge badge-sm badge-danger font-weight-semibold font-12">Disapproved</span>;
    else
        return <span className="badge badge-sm badge-warning font-weight-semibold font-12">Pending</span>;
}

export const getBucketPlanStatus = (status) => {
    if (status === "Active")
        return <span className="badge badge-sm badge-success font-weight-semibold font-12">{status}</span>;
    else if (status === 'In-active')
        return <span className="badge badge-sm badge-warning font-weight-semibold font-12">{status}</span>;
    else
        return <span className="badge badge-sm badge-danger font-weight-semibold font-12">{status}</span>;
}

export const getLeaveOnlyStatus = (leave_type) => {
    if (leave_type === 1)
        return "Pending";
    else if (leave_type === 2)
        return "Approved";
    else if (leave_type === 3)
        return "Disapproved";
    else
        return "Pending";
}

export const getTaskboardHappyStatus = (happy_status) => {
    if (happy_status === 'happy')
        return <i className="fa-solid fa-face-smile ms-auto font-24 text-success"></i>;
    else if (happy_status === "unhappy")
        return <i className="fa-solid fa-face-meh ms-auto font-24 text-warning"></i>;
    else if (happy_status === "angry")
        return <i className="fa-solid fa-face-angry ms-auto font-24 text-danger"></i>;
    else
        return <i className="fa-solid fa-face-smile ms-auto font-24 text-warning"></i>;
}


export const generateRandomPassword = (setPassword) => {
    var length = 12, charset = "abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setPassword(`${retVal}@`);
}

export const appHappyText = (description) => {
    let newDescription = description;
    let eleStyle = "color:rgb(255, 59, 0);font-weight:bold;";
    newDescription = newDescription.replaceAll('congratulations!', `<span style="${eleStyle}">congratulations!</span>`).replaceAll('Congratulations!', `<span style="${eleStyle}">Congratulations!</span>`);

    newDescription = newDescription.replaceAll('congrats!', `<span style="${eleStyle}">congrats!</span>`).replaceAll('Congrats!', `<span style="${eleStyle}">Congrats!</span>`);

    newDescription = newDescription.replaceAll('feel happy!', `<span style="${eleStyle}">feel happy!</span>`).replaceAll('Feel happy!', `<span style="${eleStyle}">Feel happy!</span>`).replaceAll('Feel Happy!', `<span style="${eleStyle}">Feel Happy!</span>`);

    newDescription = newDescription.replaceAll('happy!', `<span style="${eleStyle}">happy!</span>`).replaceAll('Happy!', `<span style="${eleStyle}">Happy!</span>`);

    newDescription = newDescription.replaceAll('awesome!', `<span style="${eleStyle}">awesome!</span>`).replaceAll('Awesome!', `<span style="${eleStyle}">Awesome!</span>`);

    newDescription = newDescription.replaceAll('yay!', `<span style="${eleStyle}">yay!</span>`).replaceAll('Yay!', `<span style="${eleStyle}">Yay!</span>`);

    return newDescription;
}

export const replaceSpecialCharacters = (description) => {
    //return description.replaceAll('&rsquo;', "'").replaceAll('&lsquo;', "‘").replaceAll('&ldquo;', "“").replaceAll('&ndash;', "-");
    return description.replaceAll('&amp;','&').replaceAll('href="view-task', `href="/view-task`).replaceAll('href="view-site-addons-task', `href="/view-site-addons-task`).replaceAll('pointer-events: none;','').replaceAll('pointer-events-none','').replaceAll('class=','data-class=');
}

export function getMonthWeek(dateString) {
    const date = new Date(dateString);
    //const month = date.getMonth() + 1; // getMonth() returns 0-indexed month, so add 1
    const weekNumber = Math.ceil(date.getDate() / 7);

    return `Week ${weekNumber}`;
}
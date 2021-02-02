import moment from 'moment';

export const timeFormat = timeStamp => {
    if (timeStamp) {
        if (moment(timeStamp).isValid()) {
            return '';
        }
        if (moment().diff(moment.unix(timeStamp.seconds), 'days') == 0) {
            return moment.unix(timeStamp.seconds).format('hh:mm A');
        }
        return moment.unix(timeStamp.seconds).fromNow();
    }
    return '';
};

import {sleep, randint, to_yyyymmdd} from '../utils';

function to_monday(d, week_delta) {
    // 'yyyy-mm-dd' for the monday of the given week of the prev date of `d``

    let dow = d.getDay();
    if (dow===0)
        dow = 7;

    let monday = new Date(d - 86400*1000 - (dow-1)*86400*1000 + week_delta*7*86400*1000);
    return to_yyyymmdd(monday);
}

export async function get_list_shuttle(week_delta) {
    let monday = to_monday(new Date(), week_delta);

    let res = null;
    if(process.env.NODE_ENV!=='production') if(window.EUTOPIA_USE_MOCK) {
        console.log('mocking list_shuttle', week_delta);
        await sleep(500+randint(1500));

        if(week_delta===0)
            res = await fetch('/mock/mocked_list_shuttle_thisweek.json');
        else if(week_delta===1)
            res = await fetch('/mock/mocked_list_shuttle_nextweek.json');
    }

    if(res===null) {
        res = await fetch(
            '/site/reservation/list-page'
            +'?hall_id=13'
            +`&time=${monday}`
        );
    }
    let data = await res.json();
    if(data.e!==0)
        throw new Error(`${data.e}: ${data.m}`);

    return data.d.list;
}
import {sleep, randint} from '../utils';
import {handle_redirect} from './common';

export async function reserve(track_id, date_str, time_id) {
    if(process.env.NODE_ENV!=='production') if(window.EUTOPIA_USE_MOCK) {
        console.log('mocking reserve', track_id, date_str, time_id);
        await sleep(500+randint(500));
        return;
    }

    let res = await fetch('/site/reservation/launch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            resource_id: track_id,
            code: '',
            remarks: '',
            deduct_num: '',
            data: JSON.stringify([{
                date: date_str,
                period: time_id,
                sub_resource_id: 0,
            }]),
        }),
        redirect: 'manual',
    });

    handle_redirect(res);

    let data = await res.json();
    if(data.e!==0)
        throw new Error(`${data.e}: ${data.m}`);

    //window.alert(data.m);
}

export async function revoke(res_id) {
    if(process.env.NODE_ENV!=='production') if(window.EUTOPIA_USE_MOCK) {
        console.log('mocking revoke', res_id);
        await sleep(500+randint(500));
        return;
    }

    let res = await fetch('/site/reservation/update-state', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            appointment_id: res_id,
            type: '1',
        }),
        redirect: 'manual',
    });

    handle_redirect(res);

    let data = await res.json();
    if(data.e!==0)
        throw new Error(`${data.e}: ${data.m}`);

    //window.alert(data.m);
}

export async function signin(id) {
    window.open('/v2/reserve/m_signIn?id='+encodeURIComponent(id));
    await sleep(1000); // reload data after popup is fully loaded
}
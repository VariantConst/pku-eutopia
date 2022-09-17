import {useState, useContext} from 'react';

import {STATUS_MAGIC_NUMBER, STATUS_DESC} from '../data/shuttle_parser';
import {reserve, revoke, signin} from '../api/action';
import {DataCtx} from '../data/data_ctx';
import {ConfigCtx} from '../data/config_ctx';

import './ShuttleDetail.css';

export function ShuttleDetail({cell, close}) {
    let data = useContext(DataCtx);
    let {config} = useContext(ConfigCtx);
    let [loading, set_loading] = useState(false);

    function get_action(track) {
        let action_cmd = async () => await reserve(track.track_id, track.date, track.time_id);
        let action_semantic = 'primary';
        let action_text = '预约';

        if(track.picked) {
            if(track.picked.status==='finished') {
                action_cmd = null;
                action_semantic = 'disabled';
                action_text = '已签到';
            } else if(track.picked.status==='pending_revokable') {
                action_cmd = async () => await revoke(track.picked.id);
                action_semantic = 'danger';
                action_text = '撤销';
            } else if(track.picked.status==='finished_absent') {
                action_cmd = null;
                action_semantic = 'disabled';
                action_text = '已违约';
            } else if(track.picked.status==='pending_signable') {
                action_cmd = async () => await signin(track.track_id);
                action_semantic = 'primary';
                action_text = '签到';
            } else if(track.picked.status==='pending' || track.picked.status==='pending_unkown') {
                action_cmd = null;
                action_semantic = 'disabled';
                action_text = '已预约';
            } else if(track.picked.status==='revoked') {
                // do nothing, because revoked tracks can be reserved again
            }
        } else { // not revoked
            if(track.status_id!==STATUS_MAGIC_NUMBER.AVAILABLE) {
                action_cmd = null;
                action_semantic = 'disabled';
                action_text = STATUS_DESC[track.status_id];
            }
        }

        return [action_cmd, action_semantic, action_text];
    }

    function wrapped(action, target, fn, need_confirm) {
        return async ()=>{
            if(loading)
                return;
            if(fn===null)
                return;

            if(!need_confirm || window.confirm(`要【${action}】${target} 的班车吗？`)) {
                set_loading(true);
                try {
                    await fn();
                    close();
                    data.reload_all(true);
                } catch(e) {
                    console.error(e);
                    window.alert(`${action}失败，${e}`);
                }
                set_loading(false);
            }
        };
    }

    return (<>
        <div className="eu-fullscreen-shadow" style={{zIndex: 51000}} onClick={()=>close()} />
        <div className="eu-shuttle-detail eu-drop-shadow">
            <h1 className="eu-title">{cell.title_long}</h1>
            {cell.tracks.map(track => {
                let [action_cmd, action_semantic, action_text] = get_action(track);
                if(loading)
                    action_semantic = 'disabled';

                return (
                    <div key={track.track_id} className="eu-shuttle-detail-row">
                        <div className="eu-shuttle-detail-name">
                            #{track.track_id}：
                            {track.track_name}
                        </div>
                        <div
                            className={'eu-shuttle-detail-action eu-shuttle-detail-action-'+action_semantic}
                            onClick={wrapped(action_text, track.track_name, action_cmd, action_semantic==='danger')}
                        >
                            <div className="eu-shuttle-detail-action-title">{action_text}</div>
                            <div className="eu-shuttle-detail-action-desc">
                                {config.showtext==='picked' ? <>已约 {track.capacity - track.left}</> : <>剩余 {track.left}</>}
                                {' / '}{track.capacity}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </>);
}
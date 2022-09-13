import {useState, useContext} from 'react';

import {DIR_KEYS_LIST, DescribeDirectionShort} from '../data/shuttle_parser';
import {ConfigCtx} from '../data/config_ctx';
import {ShuttleDetail} from './ShuttleDetail';

import './ShuttleTable.css';

function DateDescriptor({date_str, next_track}) {
    let date = new Date(date_str);

    let is_today = date.toDateString() === (new Date()).toDateString();
    let is_yesterday = date.toDateString() === (new Date((+new Date()) - 86400*1000)).toDateString();
    let weekday_desc = '周' + '日一二三四五六日'[date.getDay()];

    return (
        <th className={'eu-table-pillcell eu-table-datedesc' + ((next_track && date_str===next_track.date) ? ' eu-table-highlighted' : '')}>
            <b>{
                is_today ? '今天' :
                is_yesterday ? '昨天' :
                    weekday_desc
            }</b>{' '}
            <small>
                {date.getMonth()+1}-{date.getDate()}
            </small>
        </th>
    );
}

function CellDescriptor({celldesc, open_detail}) {
    let {config} = useContext(ConfigCtx);

    if(celldesc===null)
        return null;

    let dirs = [];

    for(let dir of DIR_KEYS_LIST) {
        if(!Object.prototype.hasOwnProperty.call(celldesc, dir)) {
            dirs.push(<div key={dir} className="eu-pill-item eu-color-empty" />);
            continue;
        }

        let tracks = celldesc[dir];

        let picked = false;
        let available = false;
        let tot_left = 0;
        let tot_picked = 0;
        let passed = false;

        for(let track of tracks) {
            if(track.picked)
                picked = true;

            if(track.available)
                available = true;

            if(track.passed)
                passed = true;

            tot_left += track.left;
            tot_picked += track.capacity - track.left;
        }

        dirs.push(
            <div
                key={dir} onClick={()=>open_detail(tracks)}
                className={'eu-pill-item eu-color-'+(picked ? 'picked' : available ? 'available' : (!passed && tot_left===0) ? 'full' : 'disabled')}
            >
                <div className="eu-pill-itemtitle"><DescribeDirectionShort dir={dir} /></div>
                <div className="eu-pill-itemdesc">
                    {config.showtext==='picked' ? tot_picked : tot_left}
                </div>
            </div>
        );
    }

    return (
        <div className="eu-pill">
            {dirs}
        </div>
    )
}

export function ShuttleTable({data}) {
    let [detail, set_detail] = useState(null);

    let is_touch = navigator.maxTouchPoints > 0;

    return (<>
        <div className="eu-width-container eu-drop-shadow" style={{height: '100%'}}>
            <div className="eu-table-scroller">
                <table className={'eu-table' + (is_touch ? ' eu-table-touch' : '')}>
                    <thead>
                        <tr>
                            <th className="eu-table-timecell" />
                            {data.date_keys.map(date=>
                                <DateDescriptor key={date} date_str={date} next_track={data.next_track} />
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="eu-table-padding-top">
                            <th className="eu-table-timecell" />
                        </tr>
                        {data.time_keys.map(time=>
                            <tr key={time}>
                                <th className={'eu-table-timecell' + ((data.next_track && time===data.next_track.time) ? ' eu-table-highlighted' : '')}>
                                    {time}
                                </th>

                                {data.date_keys.map(date=>
                                    <td key={date} className="eu-table-pillcell">
                                        <CellDescriptor celldesc={data.cells[`${date}/${time}`] || null} open_detail={set_detail} />
                                    </td>
                                )}
                            </tr>
                        )}
                        <tr className="eu-table-padding-bottom">
                            <th className="eu-table-timecell" />
                            <td colSpan={2} className="eu-legend-row">
                                <span className="eu-legend-box eu-color-available" /> 可预约
                                <span className="eu-legend-box eu-color-picked" /> 已预约
                                <span className="eu-legend-box eu-color-full" /> 已约满
                                <span className="eu-legend-box eu-color-disabled" /> 已过期
                            </td>
                            <td></td> {/* <- last-child gets `padding-right: 1em` */}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {detail!==null &&
            <ShuttleDetail cells={detail} close={()=>set_detail(null)} />
        }
    </>)
}
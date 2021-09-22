import Mithril from 'mithril';
import {ConfigType, Dayjs} from 'dayjs';
import 'dayjs/plugin/relativeTime';

declare global {
    const m: Mithril.Static;

    function dayjs(config?: ConfigType): Dayjs;
}

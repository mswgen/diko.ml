import type Discord from 'discord.js';
import cp from 'child_process';
export default {
    countTime: (time: number): string => {
        let remaining: number = time;
        let day: number = 0;
        let hour: number = 0;
        let minute: number = 0;
        let second: number = 0;
        let ms: number = 0;
        day = Math.floor(remaining / 86400000);
        remaining -= day * 86400000;
        hour = Math.floor(remaining / 3600000);
        remaining -= hour * 3600000;
        minute = Math.floor(remaining / 60000);
        remaining -= minute * 60000;
        second = Math.floor(remaining / 1000);
        remaining -= second * 1000;
        ms = remaining;
        return (
            day + "일 " + hour + "시간 " + minute + "분 " + second + "초 " + ms + "ms"
        );
    },
    getOs: (client: Discord.Client): string => {
        const _os = {
            win32: 'Windows',
            linux: 'Linux',
            darwin: 'macOS',
            android: 'Android',
            aix: 'Aix',
            freebsd: 'FreeBSD',
            sunos: 'Solaris',
            openbsd: 'OpenBSD',
            haiku: 'Haiku',
            netbsd: 'NetBSD',
            cygwin: 'Windows (Cygwin)'
        }
        if (process.platform != 'darwin') {
            if (_os[process.platform]) return _os[process.platform];
            else return process.platform;
        } else {
            try {
                const checkHackin = cp.execSync('kextstat | grep -E "VirtualSMC|FakeSMC"').toString();
                if (checkHackin != '') return 'macOS (해킨토시)';
                else return 'macOS';
            } catch (e) {
                return 'macOS';
            }
        }
    },
    snow2unix: (snowflake: string): number => {
        return Number(snowflake) / 4194304 + 1420070400000
    }
}

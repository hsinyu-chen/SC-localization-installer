import { ZipWriter, BlobReader, TextReader } from '@zip.js/zip.js';
import './index.scss'
import { DropZone } from './DropZone';
(() => {
    function saveFile(blob: Blob, filename: string) {
        const a = document.createElement('a');
        document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 0)
    }
    const [iniFdz, cfgFdz] = Array.from(document.querySelectorAll<HTMLElement>('.drop-zone')).map(e => new DropZone(e))
    const btns = Array.from(document.querySelectorAll<HTMLElement>('.action'))
    const t2s = document.querySelector<HTMLInputElement>('#s2t-input')
    const fileChange = (e?: File) => {
        btns.forEach(x => x.classList.toggle('disabled', !iniFdz.file));
    }
    iniFdz.onFileSelected.push(fileChange)
    cfgFdz.onFileSelected.push(fileChange)
    const [zipBtn, installBtn] = btns;
    zipBtn.addEventListener('click', async () => {
        const zipFileStream = new TransformStream();
        const zipFileBlobPromise = new Response(zipFileStream.readable).blob();
        const zipWriter = new ZipWriter(zipFileStream.writable);
        try {
            if (cfgFdz.file) {
                await zipWriter.add('User.cfg', new BlobReader(await updateCfgFile(cfgFdz.file!)));
            } else {
                await zipWriter.add('User.cfg', new TextReader('g_language = chinese_(traditional)\n'))
            }
            await zipWriter.add('data/Localization/chinese_(traditional)/global.ini', new BlobReader(iniFdz.file!));
            await zipWriter.close()
            saveFile(await zipFileBlobPromise, 'SC_Localization.zip');

        } catch (e) {
            alert(`錯誤 ${e}`)
        }
        iniFdz.clear()
        cfgFdz.clear()
    })
    installBtn.addEventListener('click', async () => {
        const dir = await window.showDirectoryPicker({
            mode: 'readwrite'
        })
        await dir.getFileHandle('StarCitizen_Launcher.exe', { create: false }).then(async () => {
            const cfg = await dir.getFileHandle('User.cfg', { create: true });
            const cfgFile = await cfg.getFile();
            const result = updateCfgText(await cfgFile.text());
            const wf = await cfg.createWritable({ keepExistingData: false })
            try {
                await wf.write(result);
            } finally {
                await wf.close()
            }
            const d_data = await dir.getDirectoryHandle('data', { create: true })
            const d_Localization = await d_data.getDirectoryHandle('Localization', { create: true })
            const d_i18n = await d_Localization.getDirectoryHandle('chinese_(traditional)', { create: true })
            const i18nfh = await d_i18n.getFileHandle('global.ini', { create: true })
            const i18nwf = await i18nfh.createWritable({ keepExistingData: false })
            try {
                await i18nwf.write(iniFdz.file!);
            } finally {
                await i18nwf.close()
            }
            iniFdz.clear()
            cfgFdz.clear()
            alert('安裝完成!')
        }).catch(() => {
            alert('未找到 StarCitizen_Launcher.exe 請確認選擇正確的資料夾')
        })

    })
})()
async function readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        let fr = new FileReader();
        fr.onload = x => resolve(fr.result as string);
        fr.addEventListener('error', () => reject(fr.error))
        fr.readAsText(file)
    })
}
async function updateCfgFile(file: File): Promise<Blob> {
    const cfgText = await readFile(file)
    const resultStr = updateCfgText(cfgText);
    return createUtf8Blob(resultStr);
}

function updateCfgText(cfgText: string) {
    const configList = cfgText.split('\n').map(x => {
        const rd = x.split(/(?<=^[^=]+?)=/);
        if (rd.length == 2) {
            return [rd[0].trim(), rd[1].trim()];
        }
    }).filter(x => x) as [string, string][];

    let idx = configList.findIndex(x => x[0].trim() == 'g_language');
    if (idx < 0) {
        configList.push(['g_language', '']);
        idx = configList.length - 1;
    }
    configList[idx][1] = 'chinese_(traditional)';
    const resultStr = configList.map(x => x.join(' = ')).join('\n');
    return resultStr;
}

function createUtf8Blob(resultStr: string) {
    var uint8 = new Uint8Array(resultStr.length);
    for (var i = 0; i < uint8.length; i++) {
        uint8[i] = resultStr.charCodeAt(i);
    }
    return new Blob([uint8], { type: "text/plain" });
}
const nYear = new Date().getFullYear()
if (nYear > 2023) {
    document.querySelector('#year')!.textContent += ` - ${nYear}`
}
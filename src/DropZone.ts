export class DropZone {

    id: string;
    file?: File;
    readonly onFileSelected: ((file?: File) => void)[] = [];
    fileElement: HTMLInputElement;
    fileDisplay: any;
    accept: any;
    constructor(public area: HTMLElement) {
        this.fileElement = area.querySelector<HTMLInputElement>('input[type="file"]')!;
        this.fileDisplay = area.querySelector('.selected-file')!;
        this.accept = this.fileElement.getAttribute('accept')!;
        this.setupDrop();
        this.setupClick();
        this.id = area.getAttribute('id')!;

    }
    private setupClick() {
        this.area.addEventListener('click', (ev) => {
            this.fileElement.value = '';
            this.fileElement.click();
        });
        this.fileElement.addEventListener('change', e => {
            if (this.fileElement.files) {
                this.fileSelected(this.fileElement.files);
            }
        });
    }

    private setupDrop() {
        ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.area.addEventListener(eventName, e => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });
        ;['dragenter', 'dragover'].forEach(eventName => {
            this.area.addEventListener(eventName, (e) => {
                this.area.classList.toggle('highlight', true);
            }, false);
        });

        ;['dragleave', 'drop'].forEach(eventName => {
            this.area.addEventListener(eventName, () => {
                this.area.style.setProperty('--fileName', '');
                this.area.classList.toggle('highlight', false);
            }, false);
        });

        this.area.addEventListener('drop', ev => {
            if (ev.dataTransfer?.files) {
                this.fileSelected(ev.dataTransfer.files);
            }
        }, false);
    }
    public clear() {
        this.area.classList.toggle('selected', false);
        this.fileDisplay.textContent = '';
        this.file = undefined;
        this.onFileSelected.forEach(x => x());
    }
    private fileSelected(fl: FileList) {
        const file = fl.item(0);
        if (file && file.name.endsWith(this.accept)) {
            this.area.classList.toggle('selected', true);
            this.fileDisplay.textContent = `已選擇 ${file.name}`;
            this.file = file;
            this.onFileSelected.forEach(x => x(file));
        } else {
            this.clear()
        }
    }
}

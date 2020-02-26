var EmailsEditor;
(function (EmailsEditor) {
    class EmailAddress {
        constructor(email) {
            this.email = email;
            this.address = email;
        }
        validateSingleRawEmail(mail) {
            return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail));
        }
        get valid() {
            return this.validateSingleRawEmail(this.address);
        }
    }
    EmailsEditor.EmailAddress = EmailAddress;
})(EmailsEditor || (EmailsEditor = {}));
var EmailsEditor;
(function (EmailsEditor) {
    class SimpleComponent extends HTMLElement {
        constructor() {
            super();
        }
        generateUniqueId() {
            return '_' + Math.random().toString(36).substr(2, 9);
        }
    }
    EmailsEditor.SimpleComponent = SimpleComponent;
})(EmailsEditor || (EmailsEditor = {}));
var EmailsEditor;
(function (EmailsEditor) {
    class EmailAddressChipComponent extends EmailsEditor.SimpleComponent {
        constructor(fieldValue) {
            super();
            this.fieldValue = fieldValue;
            this.componentValue = fieldValue;
            this.id = this.generateUniqueId() + '-email-address-chip-component';
            this.render();
        }
        render() {
            this.innerHTML =
                `<div class="chip" id="${this.id}">
              <span id="${this.id}-email-address-text">${this.componentValue.address}</span>
              <span class="closebtn" id="${this.id}-delete-email-chip">&times;</span>
            </div>`;
        }
        connectedCallback() {
            var elem = document.getElementById(this.id + "-email-address-text");
            var self = this;
            if (!this.componentValue.valid) {
                elem.classList.add('bad-email');
            }
            document.getElementById(this.id + "-delete-email-chip").addEventListener('click', (e) => {
                console.log(e);
                self.dispatchEvent(new CustomEvent('emailChipDelete', { detail: self }));
            });
        }
    }
    EmailsEditor.EmailAddressChipComponent = EmailAddressChipComponent;
    customElements.define("email-address-chip", EmailAddressChipComponent);
})(EmailsEditor || (EmailsEditor = {}));
var EmailsEditor;
(function (EmailsEditor) {
    class EmailsEditorComponent extends EmailsEditor.SimpleComponent {
        constructor(sharingWhat) {
            super();
            this.id = this.generateUniqueId() + '-email-editor-component';
            this.sharedContentName = sharingWhat;
            this.render();
        }
        render() {
            this.innerHTML = `
<div class="emails-editor-container">
    <div class="header">
        <div class="header-title">
          Share <span style="font-weight: bold;">${this.sharedContentName}</span> with others
        </div>
        <div id="${this.id}" class="editor-wrapper">
          <span id="${this.id}-chip-wrapper"></span>
          <input id="${this.id}-input" type="text" class="email-input-field" placeholder="add more people..."/>
        </div>    
    </div>
    <div class="actions">
      <button class="button" id="${this.id}-editor-add-email-button">Add email</button>
      <button class="button" id="${this.id}-editor-count-emails-button">Get emails count</button>          
    </div>
</div>
`;
        }
        addEmailAddress(elem) {
            document.getElementById(this.id + "-chip-wrapper").appendChild(elem);
        }
        removeAllEmailAddresses() {
            document.getElementById(this.id + "-chip-wrapper").innerHTML = '';
        }
        connectedCallback() {
            let inputElem = document.getElementById(this.id + "-input");
            inputElem.addEventListener('keyup', (e) => {
                var newVal = this.getInputValue();
                if (newVal === ',') {
                    newVal = '';
                    this.resetInputValue();
                }
                if (newVal !== '' && (e.code.toLowerCase() === 'enter' || e.code.toLowerCase() === 'comma')) {
                    if (e.code.toLowerCase() === 'comma') {
                        newVal = newVal.slice(0, -1);
                    }
                    this.processSubmit(newVal);
                }
                else if (newVal === '' && e.code.toLowerCase() === 'backspace') {
                    this.dispatchEvent(new CustomEvent('deleteLastAdded', { detail: '' }));
                }
                else if (e.code.toLowerCase() === 'keyv' && e.ctrlKey) {
                    if (newVal.indexOf(',') !== -1) {
                        let arr = newVal.split(',');
                        arr.forEach(item => {
                            item = item.replace(' ', '');
                            this.processSubmit(item);
                        });
                    }
                }
                console.log(e);
            }, false);
            inputElem.addEventListener('keypress', e => {
                if (e.code.toLowerCase() === 'space') {
                    e.preventDefault();
                }
            });
            inputElem.addEventListener('keypress', e => {
                if (e.code.toLowerCase() === 'space') {
                    e.preventDefault();
                }
            });
            inputElem.addEventListener('blur', e => {
                let newVal = this.getInputValue();
                if (newVal !== '') {
                    this.processSubmit(this.getInputValue());
                }
            });
            document.getElementById(this.id + "-editor-add-email-button").addEventListener('click', e => {
                this.dispatchEvent(new CustomEvent('addEmail', { detail: '' }));
            });
            document.getElementById(this.id + "-editor-count-emails-button").addEventListener('click', e => {
                this.dispatchEvent(new CustomEvent('getEmailCount', { detail: '' }));
            });
        }
        getInputValue() {
            return document.getElementById(this.id + "-input").value;
        }
        resetInputValue() {
            document.getElementById(this.id + "-input").value = '';
        }
        processSubmit(newRawValue) {
            this.dispatchEvent(new CustomEvent('newRawEmailAdded', { detail: newRawValue }));
            this.resetInputValue();
        }
    }
    EmailsEditor.EmailsEditorComponent = EmailsEditorComponent;
    customElements.define("emails-editor-component", EmailsEditorComponent);
})(EmailsEditor || (EmailsEditor = {}));
var EmailsEditor;
(function (EmailsEditor) {
    class Main {
        constructor(container, options) {
            this.container = container;
            this.options = options;
            this.emailAddresses = [];
            this.parentContainer = container;
            this.sharedContentName = options.sharedContentName;
            this.render();
        }
        render() {
            if (!this.editorComponent) {
                this.editorComponent = new EmailsEditor.EmailsEditorComponent(this.sharedContentName);
                this.parentContainer.appendChild(this.editorComponent);
                this.editorComponent.addEventListener('newRawEmailAdded', e => {
                    this.emailAddresses.push(new EmailsEditor.EmailAddress(e.detail));
                    this.fireChangeCb();
                    this.render();
                }, false);
                this.editorComponent.addEventListener('addEmail', e => {
                    this.emailAddresses.push(new EmailsEditor.EmailAddress(this.getRandomEmail()));
                    this.fireChangeCb();
                    this.render();
                });
                this.editorComponent.addEventListener('getEmailCount', e => {
                    alert('There are ' + this.getEmailsCount() + ' valid emails.');
                });
                this.editorComponent.addEventListener('deleteLastAdded', e => {
                    this.deleteLastAddedAddress();
                    this.fireChangeCb();
                    this.render();
                });
            }
            else {
                this.editorComponent.removeAllEmailAddresses();
            }
            this.emailAddresses.forEach((item, i) => {
                var newChip = new EmailsEditor.EmailAddressChipComponent(item);
                newChip.addEventListener('emailChipDelete', e => {
                    console.log(e.detail.componentValue);
                    this.removeEmailFromList(e.detail.componentValue.address);
                    this.render();
                });
                this.editorComponent.addEmailAddress(newChip);
            });
        }
        removeEmailFromList(addressToRemove) {
            this.emailAddresses = this.emailAddresses.filter(function (obj) {
                return obj.address !== addressToRemove;
            });
            this.fireChangeCb();
        }
        getRandomEmail() {
            const strValues = "abcdefg12345";
            let strEmail = "";
            let strTmp;
            for (let i = 0; i < 10; i++) {
                strTmp = strValues.charAt(Math.round(strValues.length * Math.random()));
                strEmail = strEmail + strTmp;
            }
            strTmp = "";
            strEmail = strEmail + "@";
            for (let j = 0; j < 8; j++) {
                strTmp = strValues.charAt(Math.round(strValues.length * Math.random()));
                strEmail = strEmail + strTmp;
            }
            strEmail = strEmail + ".com";
            return strEmail;
        }
        getEmailsCount() {
            let validEmails = this.emailAddresses.filter(function (obj) {
                return obj.valid;
            });
            return validEmails.length;
        }
        deleteLastAddedAddress() {
            if (this.emailAddresses.length > 0) {
                this.emailAddresses.pop();
                this.fireChangeCb();
            }
        }
        getEmails() {
            return this.emailAddresses;
        }
        addEmails(items) {
            items.forEach(item => {
                this.emailAddresses.push(item);
            });
            this.fireChangeCb();
        }
        setEmails(items) {
            this.emailAddresses = [];
            if (items.length > 0) {
                this.addEmails(items);
            }
            this.fireChangeCb();
        }
        fireChangeCb() {
            if (this._onChangeCB instanceof Function) {
                this._onChangeCB(this.emailAddresses);
            }
        }
        subscribeToChanges(cb) {
            if (cb instanceof Function) {
                this._onChangeCB = cb;
            }
        }
    }
    EmailsEditor.Main = Main;
})(EmailsEditor || (EmailsEditor = {}));

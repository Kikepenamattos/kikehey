/**
 * Agreements Component - Reutilizable
 * 
 * Componente reutilizable para gestionar agreements (acuerdos) con persistencia de datos.
 * 
 * Uso:
 *   const agreements = new AgreementsComponent({
 *     prefix: 'project', // Prefijo para los IDs (opcional, default: 'agreement')
 *     sectionId: 'projectAgreementsSection', // ID del contenedor principal
 *     onDataChange: (data) => { // Callback cuando cambian los datos
 *       console.log('Agreements data:', data);
 *     }
 *   });
 *   agreements.init();
 * 
 * Para cargar datos guardados:
 *   agreements.loadData([
 *     {
 *       name: 'Meeting May 5',
 *       date: 'May 5, 2024',
 *       status: 'to-start',
 *       items: ['Item 1', 'Item 2']
 *     }
 *   ]);
 * 
 * Para obtener datos actuales:
 *   const data = agreements.getData();
 */

(function() {
    'use strict';

    // Helper functions para date picker y status dropdown (reutilizables)
    function initDatePicker(pickerId, buttonId, buttonTextId) {
        const picker = document.getElementById(pickerId);
        const button = document.getElementById(buttonId);
        const buttonText = document.getElementById(buttonTextId);
        
        if (!picker || !button) return;
        
        let currentDate = new Date();
        let selectedDate = null;
        
        function renderDatePicker(date) {
            const year = date.getFullYear();
            const month = date.getMonth();
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const daysInPrevMonth = new Date(year, month, 0).getDate();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                              'July', 'August', 'September', 'October', 'November', 'December'];
            const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            let html = `
                <div class="dsu-date-picker__header">
                    <button class="dsu-date-picker__nav-button" data-action="prev">
                        <img src="images/left-chevron.svg" alt="Previous">
                    </button>
                    <div class="dsu-date-picker__month-year">${monthNames[month]} ${year}</div>
                    <button class="dsu-date-picker__nav-button" data-action="next">
                        <img src="images/right-chevron.svg" alt="Next">
                    </button>
                </div>
                <div class="dsu-date-picker__calendar">
                    <div class="dsu-date-picker__weekdays">
                        ${weekdays.map(day => `<div class="dsu-date-picker__weekday">${day}</div>`).join('')}
                    </div>
                    <div class="dsu-date-picker__days">
            `;
            
            // Previous month days
            for (let i = firstDay - 1; i >= 0; i--) {
                const day = daysInPrevMonth - i;
                html += `<div class="dsu-date-picker__day dsu-date-picker__day--other-month">${day}</div>`;
            }
            
            // Current month days
            for (let day = 1; day <= daysInMonth; day++) {
                const dateObj = new Date(year, month, day);
                const isToday = dateObj.getTime() === today.getTime();
                const isSelected = selectedDate && dateObj.getTime() === selectedDate.getTime();
                const classes = ['dsu-date-picker__day'];
                if (isToday) classes.push('dsu-date-picker__day--today');
                if (isSelected) classes.push('dsu-date-picker__day--selected');
                
                html += `<div class="${classes.join(' ')}" data-day="${day}">${day}</div>`;
            }
            
            // Next month days
            const totalCells = firstDay + daysInMonth;
            const remainingCells = 42 - totalCells;
            for (let day = 1; day <= remainingCells && day <= 14; day++) {
                html += `<div class="dsu-date-picker__day dsu-date-picker__day--other-month">${day}</div>`;
            }
            
            html += `
                    </div>
                </div>
            `;
            
            picker.innerHTML = html;
            
            // Event listeners for navigation
            picker.querySelector('[data-action="prev"]').addEventListener('click', function(e) {
                e.stopPropagation();
                currentDate = new Date(year, month - 1, 1);
                renderDatePicker(currentDate);
            });
            
            picker.querySelector('[data-action="next"]').addEventListener('click', function(e) {
                e.stopPropagation();
                currentDate = new Date(year, month + 1, 1);
                renderDatePicker(currentDate);
            });
            
            // Event listeners for day selection
            picker.querySelectorAll('.dsu-date-picker__day[data-day]').forEach(dayEl => {
                dayEl.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const day = parseInt(dayEl.dataset.day);
                    selectedDate = new Date(year, month, day);
                    renderDatePicker(currentDate);
                    
                    // Update button text
                    if (buttonText) {
                        const dateStr = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        buttonText.textContent = dateStr;
                    }
                    
                    picker.classList.remove('dsu-date-picker--visible');
                });
            });
        }
        
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const isVisible = picker.classList.contains('dsu-date-picker--visible');
            
            // Close all other pickers
            document.querySelectorAll('.dsu-date-picker--visible').forEach(p => {
                if (p !== picker) p.classList.remove('dsu-date-picker--visible');
            });
            
            if (isVisible) {
                picker.classList.remove('dsu-date-picker--visible');
            } else {
                currentDate = selectedDate || new Date();
                renderDatePicker(currentDate);
                picker.classList.add('dsu-date-picker--visible');
            }
        });
        
        // Close picker when clicking outside
        document.addEventListener('click', function(e) {
            if (!picker.contains(e.target) && !button.contains(e.target) && !e.target.closest('.dsu-date-button-wrapper')) {
                picker.classList.remove('dsu-date-picker--visible');
            }
        }, true);
    }

    function initStatusDropdown(buttonId, dropdownId, chevronId, textId) {
        const button = document.getElementById(buttonId);
        const dropdown = document.getElementById(dropdownId);
        const chevron = document.getElementById(chevronId);
        const text = document.getElementById(textId);
        
        if (!button || !dropdown) return;
        
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const isExpanded = dropdown.classList.contains('dsu-status-dropdown--expanded');
            
            // Close all other dropdowns
            document.querySelectorAll('.dsu-status-dropdown--expanded').forEach(d => {
                if (d !== dropdown) {
                    d.style.maxHeight = '0px';
                    d.classList.remove('dsu-status-dropdown--expanded');
                    const btn = d.parentElement.querySelector('.dsu-status-button');
                    const chv = btn?.querySelector('.dsu-status-button__chevron img');
                    if (chv) {
                        chv.src = chv.src.replace('up-chevron.svg', 'down-chevron.svg');
                    }
                }
            });
            
            if (isExpanded) {
                dropdown.style.maxHeight = '0px';
                dropdown.classList.remove('dsu-status-dropdown--expanded');
                if (chevron) {
                    chevron.src = chevron.src.replace('up-chevron.svg', 'down-chevron.svg');
                }
            } else {
                dropdown.classList.add('dsu-status-dropdown--expanded');
                dropdown.style.maxHeight = dropdown.scrollHeight + 'px';
                if (chevron) {
                    chevron.src = chevron.src.replace('down-chevron.svg', 'up-chevron.svg');
                }
            }
        });
        
        // Handle option selection
        const dropdownItems = dropdown.querySelectorAll('.dsu-status-dropdown__item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.stopPropagation();
                const newStatus = this.getAttribute('data-status');
                const statusTextContent = this.querySelector('.dsu-status-dropdown__text').textContent;
                
                // Update button
                button.className = 'dsu-status-button dsu-status-button--' + newStatus;
                if (text) text.textContent = statusTextContent;
                
                // Remove active from all items and add to selected
                dropdownItems.forEach(i => i.classList.remove('dsu-status-dropdown__item--active'));
                this.classList.add('dsu-status-dropdown__item--active');
                
                // Close dropdown
                dropdown.style.maxHeight = '0px';
                dropdown.classList.remove('dsu-status-dropdown--expanded');
                if (chevron) {
                    chevron.src = chevron.src.replace('up-chevron.svg', 'down-chevron.svg');
                }
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdown.contains(e.target) && !button.contains(e.target) && !e.target.closest('.dsu-status-button-wrapper')) {
                dropdown.style.maxHeight = '0px';
                dropdown.classList.remove('dsu-status-dropdown--expanded');
                if (chevron) {
                    chevron.src = chevron.src.replace('up-chevron.svg', 'down-chevron.svg');
                }
            }
        });
    }

    // AgreementsComponent Class
    window.AgreementsComponent = function(options) {
        options = options || {};
        this.prefix = options.prefix || 'agreement';
        this.sectionId = options.sectionId || `${this.prefix}Section`;
        this.onDataChange = options.onDataChange || function() {};
        this.agreementCounter = 0;
        this.agreementsData = [];
        
        // Generate IDs with prefix
        this.ids = {
            section: this.sectionId,
            default: `${this.prefix}Default`,
            empty: `${this.prefix}Empty`,
            active: `${this.prefix}Active`,
            addOneBtn: `${this.prefix}AddOneBtn`,
            createBtn: `${this.prefix}CreateAgreementBtn`,
            closeBtn: `${this.prefix}CloseBtn`,
            activeCloseBtn: `${this.prefix}ActiveCloseBtn`
        };
    };

    AgreementsComponent.prototype = {
        init: function() {
            const agreementsSection = document.getElementById(this.ids.section);
            if (!agreementsSection) {
                console.warn(`⚠️ Sección de agreements no encontrada: ${this.ids.section}`);
                return;
            }

            const defaultContainer = document.getElementById(this.ids.default);
            const emptyContainer = document.getElementById(this.ids.empty);
            const activeContainer = document.getElementById(this.ids.active);
            const addOneBtn = document.getElementById(this.ids.addOneBtn);
            const createAgreementBtn = document.getElementById(this.ids.createBtn);
            const closeBtn = document.getElementById(this.ids.closeBtn);
            const activeCloseBtn = document.getElementById(this.ids.activeCloseBtn);

            if (!addOneBtn || !defaultContainer || !emptyContainer) {
                console.warn('⚠️ Elementos principales de agreements no encontrados');
                return;
            }

            // State: Default -> Empty
            addOneBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (defaultContainer) defaultContainer.style.display = 'none';
                if (emptyContainer) emptyContainer.style.display = 'block';
                
                // Initialize first agreement form if needed
                this.ensureAgreementFormExists(emptyContainer);
                emptyContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });

            // Close button - Empty state
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    if (emptyContainer) emptyContainer.style.display = 'none';
                    if (activeContainer) activeContainer.style.display = 'none';
                    if (defaultContainer) defaultContainer.style.display = 'block';
                });
            }

            // Close button - Active state
            if (activeCloseBtn) {
                activeCloseBtn.addEventListener('click', () => {
                    if (emptyContainer) emptyContainer.style.display = 'none';
                    if (activeContainer) activeContainer.style.display = 'none';
                    if (defaultContainer) defaultContainer.style.display = 'block';
                });
            }

            // Create new agreement button
            if (createAgreementBtn) {
                createAgreementBtn.addEventListener('click', () => {
                    this.createNewAgreementGroup();
                });
            }

            // Initialize first agreement form
            this.ensureAgreementFormExists(emptyContainer);
        },

        ensureAgreementFormExists: function(emptyContainer) {
            if (!emptyContainer) return;
            
            const contentContainer = emptyContainer.querySelector('.dsu-agreements__content');
            const existingForm = document.getElementById(`${this.prefix}AgreementForm`);
            
            if (!existingForm && contentContainer) {
                this.createNewAgreementGroup();
            }
        },

        createNewAgreementGroup: function() {
            this.agreementCounter++;
            const uniqueId = this.agreementCounter;
            const emptyContainer = document.getElementById(this.ids.empty);
            if (!emptyContainer) return;

            const contentContainer = emptyContainer.querySelector('.dsu-agreements__content');
            const createBtn = document.getElementById(this.ids.createBtn);
            if (!contentContainer || !createBtn) return;

            // Create agreement element
            const agreementDiv = document.createElement('div');
            agreementDiv.className = 'dsu-agreements__agreement';
            agreementDiv.id = `${this.prefix}AgreementForm_${uniqueId}`;
            
            agreementDiv.innerHTML = `
                <div class="dsu-agreements__agreement-header">
                    <div class="dsu-input-group agreement-name-input-wrapper" style="flex: 1; position: relative;">
                        <div class="dsu-input-label">
                            <span>Agreement name</span>
                        </div>
                        <input type="text" class="dsu-input" id="${this.prefix}AgreementName_${uniqueId}" placeholder="i.e: Meeting May 5">
                        <button class="agreement-name-edit-btn" id="${this.prefix}AgreementNameEditBtn_${uniqueId}" style="display: none; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: transparent; border: none; cursor: pointer; padding: 4px; margin-top: 12px;">
                            <img src="images/Edit.svg" alt="Edit" style="width: 20px; height: 20px;">
                        </button>
                    </div>
                    <button class="dsu-agreements__agreement-toggle" id="${this.prefix}EmptyToggleBtn_${uniqueId}" style="display: none;">
                        <img src="images/minus.svg" alt="Collapse">
                    </button>
                </div>
                
                <div class="dsu-agreements__agreement-meta" id="${this.prefix}EmptyMeta_${uniqueId}">
                    <div class="dsu-date-button-wrapper">
                        <button class="dsu-button dsu-button--secondary dsu-button--small" id="${this.prefix}AgreementDateButton_${uniqueId}">
                            <span class="dsu-agreements__date-button-icon">
                                <img src="images/calendar.svg" alt="Calendar">
                            </span>
                            <span id="${this.prefix}AgreementDateButtonText_${uniqueId}">Select a date</span>
                        </button>
                        <div class="dsu-date-picker" id="${this.prefix}AgreementDatePicker_${uniqueId}"></div>
                    </div>
                    <div class="dsu-agreements__agreement-status">
                        <div class="dsu-status-button-wrapper">
                            <div class="dsu-status-button dsu-status-button--to-start" id="${this.prefix}AgreementStatusButton_${uniqueId}">
                                <span class="dsu-status-button__text" id="${this.prefix}AgreementStatusButtonText_${uniqueId}">To start</span>
                                <span class="dsu-status-button__chevron">
                                    <img src="images/down-chevron.svg" alt="Dropdown" id="${this.prefix}AgreementStatusChevron_${uniqueId}">
                                </span>
                            </div>
                            <div class="dsu-status-dropdown" id="${this.prefix}AgreementStatusDropdown_${uniqueId}">
                                <button class="dsu-status-dropdown__item" data-status="to-start">
                                    <span class="dsu-status-dropdown__text">To start</span>
                                </button>
                                <button class="dsu-status-dropdown__item" data-status="in-progress">
                                    <span class="dsu-status-dropdown__text">In progress</span>
                                </button>
                                <button class="dsu-status-dropdown__item" data-status="paused">
                                    <span class="dsu-status-dropdown__text">Paused</span>
                                </button>
                                <button class="dsu-status-dropdown__item" data-status="done">
                                    <span class="dsu-status-dropdown__text">Done</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="dsu-agreements__agreement-items" id="${this.prefix}EmptyItems_${uniqueId}" style="display: none;">
                    <!-- Items will be added dynamically here -->
                </div>
            `;
            
            // Create form element
            const formDiv = document.createElement('div');
            formDiv.className = 'dsu-agreements__agreement-form';
            formDiv.id = `${this.prefix}AgreementFormForm_${uniqueId}`;
            formDiv.innerHTML = `
                <div class="dsu-input-group dsu-agreements__agreement-form-input">
                    <input type="text" class="dsu-input dsu-input--only" id="${this.prefix}AgreementItem1_${uniqueId}" placeholder="Create and send an agreement">
                </div>
                <div class="dsu-agreements__agreement-form-buttons">
                    <button class="dsu-button dsu-button--secondary dsu-button--small" id="${this.prefix}DeleteAgreementBtn_${uniqueId}">
                        Delete agreement
                    </button>
                    <button class="dsu-agreements__send-button" id="${this.prefix}SendButton_${uniqueId}" disabled>
                        <span class="dsu-agreements__send-button-icon">
                            <img src="images/mail.svg" alt="Mail">
                        </span>
                        <span>Send email</span>
                    </button>
                </div>
            `;
            
            // Insert before create button
            contentContainer.insertBefore(agreementDiv, createBtn);
            contentContainer.insertBefore(formDiv, createBtn);
            
            // Initialize functionality for the new group
            this.initAgreementGroup(uniqueId);
            
            // Scroll to new agreement
            agreementDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        },

        initAgreementGroup: function(uniqueId) {
            const self = this;
            const agreementNameInput = document.getElementById(`${this.prefix}AgreementName_${uniqueId}`);
            const dateButton = document.getElementById(`${this.prefix}AgreementDateButton_${uniqueId}`);
            const item1Input = document.getElementById(`${this.prefix}AgreementItem1_${uniqueId}`);
            const sendButton = document.getElementById(`${this.prefix}SendButton_${uniqueId}`);
            const emptyItemsContainer = document.getElementById(`${this.prefix}EmptyItems_${uniqueId}`);
            const emptyToggleBtn = document.getElementById(`${this.prefix}EmptyToggleBtn_${uniqueId}`);
            const emptyMeta = document.getElementById(`${this.prefix}EmptyMeta_${uniqueId}`);
            const deleteAgreementBtn = document.getElementById(`${this.prefix}DeleteAgreementBtn_${uniqueId}`);
            const agreementNameEditBtn = document.getElementById(`${this.prefix}AgreementNameEditBtn_${uniqueId}`);

            // Agreement name input functionality
            if (agreementNameInput) {
                agreementNameInput.addEventListener('input', function() {
                    if (sendButton && this.value.trim() && sendButton.disabled) {
                        sendButton.disabled = false;
                    }
                    self.notifyDataChange();
                });
                
                agreementNameInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter' && this.value.trim()) {
                        e.preventDefault();
                        self.updateAgreementTitle(this.value.trim(), uniqueId);
                        if (agreementNameEditBtn) agreementNameEditBtn.style.display = 'block';
                        if (sendButton) sendButton.disabled = false;
                        self.notifyDataChange();
                    }
                });
                
                agreementNameInput.addEventListener('blur', function() {
                    if (this.value.trim()) {
                        self.updateAgreementTitle(this.value.trim(), uniqueId);
                        if (agreementNameEditBtn) agreementNameEditBtn.style.display = 'block';
                        if (sendButton) sendButton.disabled = false;
                        self.notifyDataChange();
                    }
                });
            }

            // Edit button functionality
            if (agreementNameEditBtn) {
                agreementNameEditBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (agreementNameInput && agreementNameInput.value.trim()) {
                        self.updateAgreementTitle(agreementNameInput.value.trim(), uniqueId);
                        self.notifyDataChange();
                    }
                });
            }

            // Delete agreement button
            if (deleteAgreementBtn) {
                deleteAgreementBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const agreementForm = document.getElementById(`${self.prefix}AgreementForm_${uniqueId}`);
                    const agreementFormForm = document.getElementById(`${self.prefix}AgreementFormForm_${uniqueId}`);
                    
                    if (agreementForm) agreementForm.remove();
                    if (agreementFormForm) agreementFormForm.remove();
                    
                    // Check if no more agreements, show default state
                    const emptyContainer = document.getElementById(self.ids.empty);
                    if (emptyContainer) {
                        const contentContainer = emptyContainer.querySelector('.dsu-agreements__content');
                        const remainingAgreements = contentContainer ? contentContainer.querySelectorAll('.dsu-agreements__agreement').length : 0;
                        
                        if (remainingAgreements === 0) {
                            emptyContainer.style.display = 'none';
                            const defaultContainer = document.getElementById(self.ids.default);
                            if (defaultContainer) defaultContainer.style.display = 'block';
                        }
                    }
                    
                    self.notifyDataChange();
                });
            }

            // Date picker
            if (dateButton) {
                initDatePicker(
                    `${this.prefix}AgreementDatePicker_${uniqueId}`,
                    `${this.prefix}AgreementDateButton_${uniqueId}`,
                    `${this.prefix}AgreementDateButtonText_${uniqueId}`
                );
            }

            // Status dropdown
            const statusButton = document.getElementById(`${this.prefix}AgreementStatusButton_${uniqueId}`);
            const statusDropdown = document.getElementById(`${this.prefix}AgreementStatusDropdown_${uniqueId}`);
            if (statusButton && statusDropdown) {
                initStatusDropdown(
                    `${this.prefix}AgreementStatusButton_${uniqueId}`,
                    `${this.prefix}AgreementStatusDropdown_${uniqueId}`,
                    `${this.prefix}AgreementStatusChevron_${uniqueId}`,
                    `${this.prefix}AgreementStatusButtonText_${uniqueId}`
                );
            }

            // Item input
            if (item1Input) {
                item1Input.addEventListener('input', function() {
                    if (sendButton && this.value.trim() && sendButton.disabled) {
                        sendButton.disabled = false;
                    }
                });
                
                item1Input.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter' && this.value.trim()) {
                        e.preventDefault();
                        self.addEmptyAgreementItem(this.value.trim(), emptyItemsContainer, uniqueId);
                        this.value = '';
                        self.notifyDataChange();
                    }
                });
            }

            // Send button
            if (sendButton) {
                sendButton.addEventListener('click', function() {
                    if (item1Input && item1Input.value.trim()) {
                        self.addEmptyAgreementItem(item1Input.value.trim(), emptyItemsContainer, uniqueId);
                        item1Input.value = '';
                        self.notifyDataChange();
                    }
                });
            }

            // Toggle button
            if (emptyToggleBtn) {
                let emptyExpanded = true;
                emptyToggleBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const agreementFormForm = document.getElementById(`${self.prefix}AgreementFormForm_${uniqueId}`);
                    
                    if (emptyExpanded) {
                        if (emptyItemsContainer) emptyItemsContainer.style.display = 'none';
                        if (emptyMeta) emptyMeta.style.display = 'none';
                        if (agreementFormForm) agreementFormForm.style.display = 'none';
                        const img = this.querySelector('img');
                        if (img) img.src = img.src.replace('minus.svg', 'plus.svg');
                        emptyExpanded = false;
                    } else {
                        if (emptyItemsContainer && emptyItemsContainer.children.length > 0) {
                            emptyItemsContainer.style.display = 'flex';
                        }
                        if (emptyMeta) emptyMeta.style.display = 'flex';
                        if (agreementFormForm) agreementFormForm.style.display = 'flex';
                        const img = this.querySelector('img');
                        if (img) img.src = img.src.replace('plus.svg', 'minus.svg');
                        emptyExpanded = true;
                    }
                });
            }
        },

        updateAgreementTitle: function(title, uniqueId) {
            const agreementForm = document.getElementById(`${this.prefix}AgreementForm_${uniqueId}`);
            if (!agreementForm) return;
            
            const headerContainer = agreementForm.querySelector('.dsu-agreements__agreement-header');
            if (!headerContainer) return;
            
            let headerTitle = headerContainer.querySelector('.dsu-agreements__agreement-title');
            const inputWrapper = headerContainer.querySelector('.dsu-input-group');
            
            if (!headerTitle && inputWrapper) {
                headerTitle = document.createElement('p');
                headerTitle.className = 'dsu-agreements__agreement-title';
                headerTitle.style.cssText = 'font-family: var(--font-family-secondary); font-size: var(--font-size-base); font-weight: var(--font-weight-black); line-height: 1.5; color: var(--color-text-primary); margin: 0; flex: 1; cursor: text;';
                headerTitle.textContent = title;
                
                const self = this;
                headerTitle.addEventListener('click', function(e) {
                    e.stopPropagation();
                    self.editAgreementTitle(this, uniqueId);
                });
                
                inputWrapper.replaceWith(headerTitle);
                
                const emptyToggleBtn = document.getElementById(`${this.prefix}EmptyToggleBtn_${uniqueId}`);
                if (emptyToggleBtn) emptyToggleBtn.style.display = 'block';
            } else if (headerTitle) {
                headerTitle.textContent = title;
            }
        },

        editAgreementTitle: function(titleElement, uniqueId) {
            const currentTitle = titleElement.textContent;
            const headerContainer = titleElement.closest('.dsu-agreements__agreement-header');
            if (!headerContainer) return;
            
            const self = this;
            const inputGroup = document.createElement('div');
            inputGroup.className = 'dsu-input-group';
            inputGroup.style.cssText = 'flex: 1;';
            inputGroup.innerHTML = `
                <div class="dsu-input-label">
                    <span>Agreement name</span>
                </div>
                <input type="text" class="dsu-input" id="${this.prefix}AgreementNameEdit_${uniqueId}" value="${currentTitle}" placeholder="i.e: Meeting May 5">
            `;
            
            titleElement.replaceWith(inputGroup);
            
            const input = inputGroup.querySelector(`#${this.prefix}AgreementNameEdit_${uniqueId}`);
            if (input) {
                input.focus();
                input.select();
                
                input.addEventListener('blur', function() {
                    const newTitle = this.value.trim() || currentTitle;
                    self.updateAgreementTitle(newTitle, uniqueId);
                    self.notifyDataChange();
                });
                
                input.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter' && this.value.trim()) {
                        e.preventDefault();
                        self.updateAgreementTitle(this.value.trim(), uniqueId);
                        self.notifyDataChange();
                    }
                });
            }
        },

        addEmptyAgreementItem: function(text, container, groupId) {
            if (!container) return;
            
            if (container.style.display === 'none') {
                container.style.display = 'flex';
            }
            
            const emptyToggleBtn = document.getElementById(`${this.prefix}EmptyToggleBtn_${groupId}`);
            const emptyMeta = document.getElementById(`${this.prefix}EmptyMeta_${groupId}`);
            
            if (emptyToggleBtn && emptyToggleBtn.style.display === 'none') {
                emptyToggleBtn.style.display = 'block';
            }
            if (emptyMeta && emptyMeta.style.display === 'none') {
                emptyMeta.style.display = 'flex';
            }
            
            const self = this;
            const item = document.createElement('div');
            item.className = 'dsu-agreements__agreement-item';
            item.innerHTML = `
                <p class="dsu-agreements__agreement-item-text">-${text}</p>
                <div class="dsu-agreements__agreement-item-actions">
                    <button class="dsu-agreements__agreement-item-action" data-action="delete">
                        <img src="images/trash.svg" alt="Delete">
                    </button>
                    <button class="dsu-agreements__agreement-item-action" data-action="edit">
                        <img src="images/Edit.svg" alt="Edit">
                    </button>
                </div>
            `;
            
            // Add event listeners
            const deleteBtn = item.querySelector('[data-action="delete"]');
            const editBtn = item.querySelector('[data-action="edit"]');
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function() {
                    item.remove();
                    self.checkEmptyItemsVisibility(groupId);
                });
            }
            
            if (editBtn) {
                editBtn.addEventListener('click', function() {
                    self.editEmptyItem(this, groupId);
                });
            }
            
            container.appendChild(item);
        },

        checkEmptyItemsVisibility: function(groupId) {
            const emptyItemsContainer = document.getElementById(`${this.prefix}EmptyItems_${groupId}`);
            const emptyToggleBtn = document.getElementById(`${this.prefix}EmptyToggleBtn_${groupId}`);
            const emptyMeta = document.getElementById(`${this.prefix}EmptyMeta_${groupId}`);
            
            if (emptyItemsContainer && emptyItemsContainer.children.length === 0) {
                emptyItemsContainer.style.display = 'none';
                if (emptyToggleBtn) {
                    emptyToggleBtn.style.display = 'none';
                    const img = emptyToggleBtn.querySelector('img');
                    if (img) img.src = img.src.replace('plus.svg', 'minus.svg');
                }
                if (emptyMeta) emptyMeta.style.display = 'flex';
            } else if (emptyItemsContainer && emptyItemsContainer.children.length > 0) {
                if (emptyToggleBtn) emptyToggleBtn.style.display = 'block';
            }
            this.notifyDataChange();
        },

        editEmptyItem: function(button, groupId) {
            const item = button.closest('.dsu-agreements__agreement-item');
            const textElement = item.querySelector('.dsu-agreements__agreement-item-text');
            const currentText = textElement.textContent.replace(/^-\s*/, '');
            const newText = prompt('Edit item:', currentText);
            if (newText && newText.trim()) {
                textElement.textContent = '-' + newText.trim();
                this.notifyDataChange();
            }
        },

        getData: function() {
            const emptyContainer = document.getElementById(this.ids.empty);
            if (!emptyContainer) return [];
            
            const agreements = [];
            const agreementForms = emptyContainer.querySelectorAll('.dsu-agreements__agreement');
            
            agreementForms.forEach((form, index) => {
                const uniqueId = form.id.split('_')[1] || (index + 1);
                const nameInput = document.getElementById(`${this.prefix}AgreementName_${uniqueId}`);
                const nameTitle = form.querySelector('.dsu-agreements__agreement-title');
                const dateButtonText = document.getElementById(`${this.prefix}AgreementDateButtonText_${uniqueId}`);
                const statusButtonText = document.getElementById(`${this.prefix}AgreementStatusButtonText_${uniqueId}`);
                const itemsContainer = document.getElementById(`${this.prefix}EmptyItems_${uniqueId}`);
                
                const name = nameTitle ? nameTitle.textContent : (nameInput ? nameInput.value.trim() : '');
                const date = dateButtonText && dateButtonText.textContent !== 'Select a date' ? dateButtonText.textContent : '';
                const status = statusButtonText ? statusButtonText.textContent.toLowerCase().replace(' ', '-') : 'to-start';
                const items = [];
                
                if (itemsContainer) {
                    itemsContainer.querySelectorAll('.dsu-agreements__agreement-item-text').forEach(itemText => {
                        items.push(itemText.textContent.replace(/^-\s*/, ''));
                    });
                }
                
                if (name || date || items.length > 0) {
                    agreements.push({
                        name: name,
                        date: date,
                        status: status,
                        items: items
                    });
                }
            });
            
            return agreements;
        },

        loadData: function(data) {
            if (!data || !Array.isArray(data) || data.length === 0) return;
            
            const emptyContainer = document.getElementById(this.ids.empty);
            const defaultContainer = document.getElementById(this.ids.default);
            
            if (!emptyContainer || !defaultContainer) return;
            
            // Hide default, show empty
            defaultContainer.style.display = 'none';
            emptyContainer.style.display = 'block';
            
            // Clear existing agreements
            const contentContainer = emptyContainer.querySelector('.dsu-agreements__content');
            const existingAgreements = contentContainer.querySelectorAll('.dsu-agreements__agreement');
            existingAgreements.forEach(agreement => agreement.remove());
            const existingForms = contentContainer.querySelectorAll('.dsu-agreements__agreement-form');
            existingForms.forEach(form => form.remove());
            
            // Reset counter
            this.agreementCounter = 0;
            
            // Load each agreement
            data.forEach((agreementData, index) => {
                this.createNewAgreementGroup();
                const uniqueId = this.agreementCounter;
                
                // Set name
                const nameInput = document.getElementById(`${this.prefix}AgreementName_${uniqueId}`);
                if (nameInput && agreementData.name) {
                    nameInput.value = agreementData.name;
                    this.updateAgreementTitle(agreementData.name, uniqueId);
                }
                
                // Set date
                const dateButtonText = document.getElementById(`${this.prefix}AgreementDateButtonText_${uniqueId}`);
                if (dateButtonText && agreementData.date) {
                    dateButtonText.textContent = agreementData.date;
                }
                
                // Set status
                if (agreementData.status) {
                    const statusButton = document.getElementById(`${this.prefix}AgreementStatusButton_${uniqueId}`);
                    const statusDropdown = document.getElementById(`${this.prefix}AgreementStatusDropdown_${uniqueId}`);
                    if (statusButton && statusDropdown) {
                        const statusItem = statusDropdown.querySelector(`[data-status="${agreementData.status}"]`);
                        if (statusItem) {
                            statusItem.click();
                        }
                    }
                }
                
                // Set items
                if (agreementData.items && Array.isArray(agreementData.items)) {
                    const itemsContainer = document.getElementById(`${this.prefix}EmptyItems_${uniqueId}`);
                    agreementData.items.forEach(itemText => {
                        this.addEmptyAgreementItem(itemText, itemsContainer, uniqueId);
                    });
                }
            });
        },

        notifyDataChange: function() {
            const data = this.getData();
            this.agreementsData = data;
            this.onDataChange(data);
        }
    };

    // Make helper functions available globally for onclick handlers
    // These are already defined in the prototype above, so we just expose them

})();

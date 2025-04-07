


let customers = [];
// 当前编辑的客户索引（null表示新增）
let currentEditIndex = null;
let currentCustomerIndex = null; // 新增当前客户索引

// 页面加载时读取本地存储数据
window.onload = function () {
    const data = localStorage.getItem('customers');
    if (data) {
        customers = JSON.parse(data);
    }
    renderTable(customers);
};

// 保存数据到本地存储
function saveToLocalStorage() {
    localStorage.setItem('customers', JSON.stringify(customers));
}

// 渲染客户表格，dataArray为当前显示的数据
function renderTable(dataArray) {
    const tbody = document.getElementById('customerTableBody');
    tbody.innerHTML = '';

    dataArray.forEach((cust, index) => {
        const tr = document.createElement('tr');


        const tdIndex = document.createElement('td');
        tdIndex.textContent = index + 1;
        tr.appendChild(tdIndex);

        const tdName = document.createElement('td');
        tdName.textContent = cust.name;
        tr.appendChild(tdName);

        const tdPhone = document.createElement('td');
        tdPhone.textContent = cust.phone;
        tr.appendChild(tdPhone);

        const tdAddress = document.createElement('td');
        tdAddress.textContent = cust.address;
        tr.appendChild(tdAddress);

        const tdAmount = document.createElement('td');
        tdAmount.textContent = cust.amount;
        tr.appendChild(tdAmount);

        const tdCustomerService = document.createElement('td');
        tdCustomerService.textContent = cust.customerService || '';
        tr.appendChild(tdCustomerService);

        const tdNote = document.createElement('td');
        tdNote.textContent = cust.note || '';
        tr.appendChild(tdNote);

        const tdDelivery = document.createElement('td');
        tdDelivery.textContent = cust.deliveryTime || '';
        tr.appendChild(tdDelivery);

        // 操作：编辑、删除
        const tdActions = document.createElement('td');
        const editBtn = document.createElement('button');
        editBtn.textContent = '修改';
        editBtn.classList.add('btn-edit');
        editBtn.onclick = () => loadCustomerToForm(index);
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '删除';
        deleteBtn.classList.add('btn-delete');
        deleteBtn.onclick = () => deleteCustomer(index);
        tdActions.appendChild(editBtn);
        tdActions.appendChild(deleteBtn);
        tr.appendChild(tdActions);
        const tdSupplierStatus = document.createElement('td');
        tdSupplierStatus.onclick = () => openSupplierModal(index); // 新增点击事件
        tdSupplierStatus.textContent = cust.suppliers?.length > 0 ?
            `回货 ${cust.selectedSuppliers?.length || 0}/未回${cust.suppliers.length - cust.selectedSuppliers?.length || 0}` :
            '无供货商';
        tr.appendChild(tdSupplierStatus);

        tbody.appendChild(tr);
    });


    // 更新合计金额（基于当前显示的数据）
    const total = dataArray.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    document.getElementById('totalAmount').textContent = '合计金额：' + total;
}

// 新增供货商管理功能
function openSupplierModal(index) {
    currentCustomerIndex = index;
    const customer = customers[index];
    const supplierList = document.getElementById('supplierList');

    supplierList.innerHTML = customer.suppliers?.map((supplier, i) => `
    <div class="supplier-item ${customer.selectedSuppliers?.includes(supplier) ? 'selected' : ''}">
        <input type="checkbox" ${customer.selectedSuppliers?.includes(supplier) ? 'checked' : ''}
            onchange="toggleSupplier(this, '${supplier}')">
            <span>${supplier}</span>
            <div class="supplier-actions">
                <button onclick="editSupplier(event, ${i})" class="btn-edit">修改</button>
                <button onclick="deleteSupplier(event, ${i})" class="btn-delete">删除</button>
            </div>
    </div>
    `).join('') || '<div>暂无供货商</div>';

    document.getElementById('supplierModal').style.display = 'flex';
}
//给newSupplierName输入框添加键盘事件
document.getElementById('newSupplierName').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        addSupplier();
    }
});

function closeSupplierModal() {
    document.getElementById('supplierModal').style.display = 'none';
}

function addSupplier() {
    const input = document.getElementById('newSupplierName');
    const name = input.value.trim();
    if (!name) return;

    const customer = customers[currentCustomerIndex];
    if (!customer.suppliers) customer.suppliers = [];
    if (!customer.selectedSuppliers) customer.selectedSuppliers = [];

    if (!customer.suppliers.includes(name)) {
        customer.suppliers.push(name);
        openSupplierModal(currentCustomerIndex);
        input.value = '';
    }
}

function deleteSupplier(event, index) {
    event.stopPropagation();
    const customer = customers[currentCustomerIndex];
    const deletedSupplier = customer.suppliers[index];
    customer.suppliers.splice(index, 1);
    customer.selectedSuppliers = customer.selectedSuppliers.filter(s => s !== deletedSupplier);
    openSupplierModal(currentCustomerIndex);
}

function editSupplier(event, index) {
    event.stopPropagation();
    const newName = prompt('请输入新的供货商名称：');
    if (newName) {
        const customer = customers[currentCustomerIndex];
        const oldName = customer.suppliers[index];
        customer.suppliers[index] = newName;
        customer.selectedSuppliers = customer.selectedSuppliers.map(s =>
            s === oldName ? newName : s
        );
        openSupplierModal(currentCustomerIndex);
    }
}

function toggleSupplier(checkbox, supplierName) {
    const customer = customers[currentCustomerIndex];
    const index = customer.selectedSuppliers.indexOf(supplierName);

    if (checkbox.checked && index === -1) {
        customer.selectedSuppliers.push(supplierName);
    } else if (!checkbox.checked && index !== -1) {
        customer.selectedSuppliers.splice(index, 1);
    }

    checkbox.parentElement.classList.toggle('selected', checkbox.checked);
}

function saveSuppliers() {
    saveToLocalStorage();
    renderTable(customers); // 更新表格中的状态显示
    closeSupplierModal();
}

// 将选中的客户加载到表单上进行编辑
function loadCustomerToForm(index) {
    const cust = customers[index];
    currentEditIndex = index;
    document.getElementById('name').value = cust.name;
    document.getElementById('phone').value = cust.phone;
    document.getElementById('address').value = cust.address;
    document.getElementById('amount').value = cust.amount;
    document.getElementById('customerService').value = cust.customerService;
    document.getElementById('note').value = cust.note;
    document.getElementById('deliveryTime').value = cust.deliveryTime;
    // 将添加按钮文本改为“更新”
    document.getElementById('addCustomerBtn').textContent = '更新';
}

// 手动添加或更新客户信息
document.getElementById('addCustomerBtn').addEventListener('click', () => {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const amount = document.getElementById('amount').value.trim();
    const customerService = document.getElementById('customerService').value.trim();
    const note = document.getElementById('note').value.trim();
    const deliveryTime = document.getElementById('deliveryTime').value;

    // 必填字段校验
    if (!name || !phone || !address || !amount || !customerService) {
        alert('客户姓名、电话、地址、金额、客服信息为必填项！');
        return;
    }

    if (currentEditIndex === null) {
        // 新增客户
        const newCustomer = {
            name,
            phone,
            address,
            amount: parseFloat(amount),
            customerService,
            note,
            deliveryTime
        };
        customers.push(newCustomer);
    } else {
        // 更新客户
        customers[currentEditIndex] = {
            name,
            phone,
            address,
            amount: parseFloat(amount),
            customerService,
            note,
            deliveryTime
        };
        currentEditIndex = null;
        // 恢复按钮文本为“添加”
        document.getElementById('addCustomerBtn').textContent = '添加';
    }

    saveToLocalStorage();
    renderTable(customers);
    clearForm();
});

// 清空手动添加区表单
function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('address').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('customerService').value = '';
    document.getElementById('note').value = '';
    document.getElementById('deliveryTime').value = '';
}

// 删除单个客户信息
function deleteCustomer(index) {
    if (confirm('确定删除该客户信息？')) {
        customers.splice(index, 1);
        saveToLocalStorage();
        renderTable(customers);
    }
}

// 一键删除所有客户信息
document.getElementById('deleteAllBtn').addEventListener('click', () => {
    if (confirm('确定删除所有客户信息？此操作不可恢复！')) {
        customers = [];
        saveToLocalStorage();
        renderTable(customers);
    }
});

// 搜索和时间筛选功能
const searchName = document.getElementById('searchName');
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const filterBtn = document.getElementById('filterBtn');
const clearFilterBtn = document.getElementById('clearFilterBtn');

// 点击筛选按钮
filterBtn.addEventListener('click', () => {
    let filtered = [...customers];

    // 按姓名搜索
    const nameKeyword = searchName.value.trim();
    if (nameKeyword) {
        filtered = filtered.filter(cust => cust.name.includes(nameKeyword));
    }

    // 按时间区间筛选
    const start = startDate.value;
    const end = endDate.value;
    if (start) {
        filtered = filtered.filter(cust => cust.deliveryTime && cust.deliveryTime >= start);
    }
    if (end) {
        filtered = filtered.filter(cust => cust.deliveryTime && cust.deliveryTime <= end);
    }

    renderTable(filtered);
});

// 清除筛选条件
clearFilterBtn.addEventListener('click', () => {
    searchName.value = '';
    startDate.value = '';
    endDate.value = '';
    renderTable(customers);
});

// 粘贴识别添加（无固定格式）——增加对多行记录的整合处理
document.getElementById('pasteAddBtn').addEventListener('click', () => {
    const pasteText = document.getElementById('pasteInput').value.trim();
    if (!pasteText) {
        alert('请先粘贴内容！');
        return;
    }

    // 如果文本中没有空行（即没有连续换行），认为所有行属于同一条记录，合并为一行
    const records = pasteText.match(/\r?\n\s*\r?\n/) ? pasteText.split(/\r?\n\s*\r?\n/) : [pasteText.replace(/\r?\n/g, ' ')];

    let addedCount = 0;
    records.forEach(record => {
        const customer = {
            name: '',
            phone: '',
            address: '',
            amount: 0,
            customerService: '',
            note: '',
            deliveryTime: ''
        };

        // 提取客服信息（匹配“客服:”或“客服：”后面的内容）
        const csMatch = record.match(/客服[:：]\s*([\u4e00-\u9fa5A-Za-z0-9]+)/);
        if (csMatch) {
            customer.customerService = csMatch[1];
        }

        // 提取客户姓名（匹配“客户:”或“客户姓名:”后面的内容）
        const nameMatch = record.match(/客户(?:姓名)?[:：]\s*([\u4e00-\u9fa5]+)/);
        if (nameMatch) {
            customer.name = nameMatch[1];
        } else {
            // 如果没有“客户姓名：”，尝试提取行首2-4个汉字
            const fallbackName = record.match(/^[\u4e00-\u9fa5]{2, 4}/);
            if (fallbackName) {
                customer.name = fallbackName[0];
            }
        }

        // 提取电话（11位数字，1开头），如果没有，则设置为“未填写”
        const phoneMatch = record.match(/(1[3-9]\d{9})/);
        customer.phone = phoneMatch ? phoneMatch[0] : '未填写';

        // 提取地址（匹配“地址:”后面的内容，简单匹配包含省、市、区或县）
        const addressMatch = record.match(/地址[:：]\s*([\u4e00-\u9fa5\s\d\-—#号]+)/);
        if (addressMatch) {
            customer.address = addressMatch[1].trim();
        }

        // 提取金额（匹配“首批:”后面的金额信息，如“30000+赠送7800=37800”）
        const amountMatch = record.match(/首批[:：]\s*(\d+(?:\+\S+)?)/);
        if (amountMatch) {
            // 如果记录中存在“=”，优先取“=”后面的总金额
            const equalIndex = record.indexOf('=');
            if (equalIndex !== -1) {
                const afterEqual = record.slice(equalIndex + 1).trim();
                customer.amount = parseFloat(afterEqual) || parseFloat(amountMatch[1]);
            } else {
                customer.amount = parseFloat(amountMatch[1]);
            }
        } else {
            // 如果没有“首批：”字段，尝试匹配任意数字作为金额
            const anyAmt = record.match(/[￥¥$]?\s*(\d+(?:\.\d{1, 2})?)/);
            if (anyAmt) {
                customer.amount = parseFloat(anyAmt[1]);
            }
        }

        // 提取交付时间（匹配日期格式，如2025-04-01、2025/04/01、2025.04.01）
        const dateMatch = record.match(/(\d{4}[-\/.]\d{1, 2}[-\/.]\d{1, 2})/);
        if (dateMatch) {
            customer.deliveryTime = dateMatch[1].replace(/[-\/.]/g, '-');
        }

        // 备注：将已识别字段从记录中剔除，其余部分作为备注
        let note = record;
        const fieldsToRemove = [customer.customerService, customer.name, customer.phone, customer.address, customer.amount.toString(), customer.deliveryTime];
        fieldsToRemove.forEach(field => {
            if (field) note = note.replace(field, '');
        });
        customer.note = note.trim();

        // 必填校验：客户姓名、地址、金额、客服信息必须存在
        if (customer.name && customer.address && customer.amount && customer.customerService) {
            customers.push(customer);
            addedCount++;
        }
    });

    if (addedCount > 0) {
        saveToLocalStorage();
        renderTable(customers);
        document.getElementById('pasteInput').value = '';
        alert(`成功添加 ${addedCount} 条客户信息！`);
    } else {
        alert('未能识别到有效的客户信息，请检查粘贴内容！');
    }
});
//检查是否登录
const user = JSON.parse(localStorage.getItem("loggedInUser"));

if (!user) {
    window.location.href = "pandalogin.html";
} else {
    document.getElementById("userAvatar").src = user.avatar;
    document.getElementById("userName").textContent = `欢迎您！${user.name}`;
}
//换头像
function changeAvatar() {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    const allUsers = JSON.parse(localStorage.getItem("allUsers"));

    // 生成新的随机头像链接
    const randomSeed = Date.now() + Math.random();
    const newUrl = `https://i.pravatar.cc/150?u=${randomSeed}`;

    // 更新头像地址
    user.avatar = newUrl;
    allUsers[user.username].avatar = newUrl;

    // 保存并更新页面
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    localStorage.setItem("allUsers", JSON.stringify(allUsers));
    document.getElementById("userAvatar").src = newUrl;
}

//退出
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "pandalogin.html";
}



//修改密码
function openChangePasswordModal() {
    document.getElementById("passwordModal").style.display = "flex";
}
function openChangePasswordModal() {
    document.getElementById("passwordModal").style.display = "flex";
}

function closePasswordModal() {
    document.getElementById("passwordModal").style.display = "none";
}

function changePassword() {
    const oldPass = document.getElementById("oldPassword").value;
    const newPass = document.getElementById("newPassword").value;
    const confirmPass = document.getElementById("confirmPassword").value;

    let user = JSON.parse(localStorage.getItem("loggedInUser"));
    let allUsers = JSON.parse(localStorage.getItem("allUsers") || "{ }");

    if (!user || !allUsers[user.username]) {
        alert("用户信息出错，请重新登录");
        return;
    }

    if (allUsers[user.username].password !== oldPass) {
        alert("旧密码不正确");
        return;
    }

    if (newPass.length < 4) {
        alert("新密码长度至少为 4 位");
        return;
    }

    if (newPass !== confirmPass) {
        alert("两次输入的新密码不一致");
        return;
    }

    // 更新密码
    allUsers[user.username].password = newPass;
    localStorage.setItem("allUsers", JSON.stringify(allUsers));

    window.location.href = 'password-changed.html';
}

const avatarSound = document.getElementById('avatarSound');

avatarSound.addEventListener('play', () => {
    // 如果已有计时器，先清除
    if (avatarSound._stopTimer) {
        clearTimeout(avatarSound._stopTimer);
    }

    // 设置 1 秒后暂停并重置
    avatarSound._stopTimer = setTimeout(() => {
        avatarSound.pause();
        avatarSound.currentTime = 0;
        avatarSound._stopTimer = null;
    }, 1000);
});

// 如果用户中途手动暂停，也清除计时器
avatarSound.addEventListener('pause', () => {
    if (avatarSound._stopTimer) {
        clearTimeout(avatarSound._stopTimer);
        avatarSound._stopTimer = null;
    }
});

const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    // 切换 body 的主题
    body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode');

    // 切换按钮状态
    themeToggle.classList.toggle('active');
});

// 初始状态设为白天模式
body.classList.add('light-mode');



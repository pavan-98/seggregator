// Initial account data - used for reset functionality
const defaultAccountData = {
    totalBalance: 80000,
    availableBalance: 75000,
    categories: [
        { 
            name: "Rent", 
            amount: 3000, 
            color: "#FF6384", 
            date: "April 15, 2025" 
        },
        { 
            name: "Groceries", 
            amount: 2000, 
            color: "#36A2EB", 
            date: "April 30, 2025" 
        }
    ]
};

// Current account data (will be updated)
let accountData = { ...defaultAccountData };

// DOM Elements
const categoriesContainer = document.querySelector('.categories');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const categoryModal = document.getElementById('categoryModal');
const closeModalBtn = document.querySelector('.close-modal');
const categoryForm = document.getElementById('categoryForm');
const availableBalanceElement = document.querySelector('.available');
const totalBalanceElement = document.querySelector('.balance');
const modalTitle = document.getElementById('modalTitle');
const submitBtn = document.getElementById('submitBtn');
const editCategoryIndex = document.getElementById('editCategoryIndex');
const categoryDateInput = document.getElementById('categoryDate');
const editBalanceBtn = document.querySelector('.edit-balance-btn');
const balanceModal = document.getElementById('balanceModal');
const closeBalanceModalBtn = document.querySelector('.close-balance-modal');
const balanceForm = document.getElementById('balanceForm');
const accountBalanceInput = document.getElementById('accountBalance');
const resetSessionBtn = document.getElementById('resetSessionBtn');
const randomDataBtn = document.getElementById('randomDataBtn');

// Chart instance
let balanceChart;

// Local storage key
const STORAGE_KEY = 'seggregatorAppData';

// Initialize the application
function initialize() {
    loadFromLocalStorage();
    renderCategories();
    initializeChart();
    setupEventListeners();
    updateBalanceDisplay();
    setDefaultDate();
}

// Save data to local storage
function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accountData));
}

// Load data from local storage
function loadFromLocalStorage() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        accountData = JSON.parse(savedData);
    }
}

// Set default date to 30 days from now
function setDefaultDate() {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    
    // Format date as YYYY-MM-DD for input element
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    categoryDateInput.value = `${year}-${month}-${day}`;
}

// Create and render the pie chart
function initializeChart() {
    const ctx = document.getElementById('balanceChart').getContext('2d');
    
    // Prepare data for the chart
    const chartData = prepareChartData();
    
    // Create the chart
    balanceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.data,
                backgroundColor: chartData.colors,
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 10,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            return `₹${value.toLocaleString()}`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true
            }
        }
    });
}

// Prepare data for the chart
function prepareChartData() {
    const labels = [];
    const data = [];
    const colors = [];
    
    // Add data for categories
    accountData.categories.forEach(category => {
        labels.push(category.name);
        data.push(category.amount);
        colors.push(category.color);
    });
    
    // Add available balance
    labels.push('Available');
    data.push(accountData.availableBalance);
    colors.push('#4BC0C0');
    
    return { labels, data, colors };
}

// Update both total and available balance display
function updateBalanceDisplay() {
    totalBalanceElement.textContent = `₹${accountData.totalBalance.toLocaleString()}`;
    availableBalanceElement.textContent = `₹${accountData.availableBalance.toLocaleString()}`;
}

// Open modal to edit account balance
function openEditBalanceModal() {
    accountBalanceInput.value = accountData.totalBalance;
    balanceModal.style.display = 'block';
}

// Handle balance update
function updateAccountBalance(newBalance) {
    // Calculate the difference between old and new total balance
    const balanceDifference = newBalance - accountData.totalBalance;
    
    // Update total balance
    accountData.totalBalance = newBalance;
    
    // Update available balance (add the difference)
    accountData.availableBalance += balanceDifference;
    
    // Update UI
    updateBalanceDisplay();
    
    // Save to local storage
    saveToLocalStorage();
    
    // Update chart
    animateChartUpdate();
}

// Render category cards
function renderCategories() {
    categoriesContainer.innerHTML = '';
    
    accountData.categories.forEach((category, index) => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.style.borderLeftColor = category.color;
        
        categoryCard.innerHTML = `
            <div class="category-header">
                <div class="category-name">${category.name}</div>
                <div class="category-icon" style="background-color: ${category.color}"></div>
            </div>
            <div class="category-amount">₹${category.amount.toLocaleString()}</div>
            <div class="category-date">Until: ${category.date}</div>
            <div class="category-actions">
                <button class="edit-btn" data-index="${index}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" data-index="${index}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        categoriesContainer.appendChild(categoryCard);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(button.dataset.index);
            openEditCategoryModal(index);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(button.dataset.index);
            deleteCategory(index);
        });
    });
}

// Open modal to edit an existing category
function openEditCategoryModal(index) {
    const category = accountData.categories[index];
    
    // Set form field values
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryAmount').value = category.amount;
    
    // Format date from text to YYYY-MM-DD
    const dateText = category.date; // e.g., "April 15, 2025"
    const dateObj = new Date(dateText);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    document.getElementById('categoryDate').value = `${year}-${month}-${day}`;
    
    // Set color dropdown
    document.getElementById('categoryColor').value = category.color;
    
    // Set edit mode
    editCategoryIndex.value = index;
    modalTitle.textContent = "Edit Category";
    submitBtn.textContent = "Update Category";
    
    // Open modal
    categoryModal.style.display = 'block';
}

// Delete a category
function deleteCategory(index) {
    if (confirm('Are you sure you want to delete this category?')) {
        // Add the amount back to available balance
        accountData.availableBalance += accountData.categories[index].amount;
        
        // Remove category
        accountData.categories.splice(index, 1);
        
        // Save to local storage
        saveToLocalStorage();
        
        // Update UI
        renderCategories();
        updateBalanceDisplay();
        animateChartUpdate();
    }
}

// Get used colors
function getUsedColors() {
    return accountData.categories.map(category => category.color);
}

// Filter out used colors from the dropdown
function filterUsedColors() {
    const colorSelect = document.getElementById('categoryColor');
    const usedColors = getUsedColors();
    const currentSelectedColor = colorSelect.value;
    const isEditMode = parseInt(editCategoryIndex.value) >= 0;
    
    // If in edit mode, include the current category's color as available
    let allowedColors = usedColors;
    if (isEditMode) {
        const editIndex = parseInt(editCategoryIndex.value);
        allowedColors = usedColors.filter((_, index) => index !== editIndex);
    }
    
    // Enable/disable options based on used colors
    Array.from(colorSelect.options).forEach(option => {
        // Disable option if the color is already used (unless it's the currently selected color in edit mode)
        option.disabled = allowedColors.includes(option.value);
    });
    
    // If the current selection is disabled, select the first available color
    if (colorSelect.selectedOptions[0].disabled) {
        const firstAvailableOption = Array.from(colorSelect.options).find(option => !option.disabled);
        if (firstAvailableOption) {
            colorSelect.value = firstAvailableOption.value;
        }
    }
}

// Set up event listeners
function setupEventListeners() {
    // Open modal when add category button is clicked
    addCategoryBtn.addEventListener('click', () => {
        // Reset form and set to add mode
        categoryForm.reset();
        editCategoryIndex.value = -1;
        modalTitle.textContent = "Create New Category";
        submitBtn.textContent = "Create Category";
        setDefaultDate();
        filterUsedColors();
        categoryModal.style.display = 'block';
    });
    
    // Close modal when close button is clicked
    closeModalBtn.addEventListener('click', () => {
        categoryModal.style.display = 'none';
    });
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === categoryModal) {
            categoryModal.style.display = 'none';
        }
        if (event.target === balanceModal) {
            balanceModal.style.display = 'none';
        }
    });
    
    // Edit balance button event listener
    editBalanceBtn.addEventListener('click', () => {
        openEditBalanceModal();
    });
    
    // Close balance modal when close button is clicked
    closeBalanceModalBtn.addEventListener('click', () => {
        balanceModal.style.display = 'none';
    });
    
    // Balance form submission
    balanceForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const newBalance = parseFloat(accountBalanceInput.value);
        if (newBalance < getTotalAllocated()) {
            alert(`Your new balance cannot be less than your total allocated amount (₹${getTotalAllocated().toLocaleString()})`);
            return;
        }
        
        updateAccountBalance(newBalance);
        balanceModal.style.display = 'none';
    });
    
    // Handle form submission
    categoryForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        // Get form values
        const name = document.getElementById('categoryName').value;
        const amount = parseFloat(document.getElementById('categoryAmount').value);
        const color = document.getElementById('categoryColor').value;
        const dateValue = document.getElementById('categoryDate').value; // YYYY-MM-DD format
        
        // Convert the date to formatted string (e.g., "April 15, 2025")
        const dateObj = new Date(dateValue);
        const formattedDate = getFormattedDateFromObject(dateObj);
        
        // Check if we're in edit mode
        const editIndex = parseInt(editCategoryIndex.value);
        const isEditMode = editIndex >= 0;
        
        if (isEditMode) {
            // Edit existing category
            const oldAmount = accountData.categories[editIndex].amount;
            
            // Update available balance (add back old amount and subtract new amount)
            accountData.availableBalance = accountData.availableBalance + oldAmount - amount;
            
            // Update category
            accountData.categories[editIndex] = {
                name,
                amount,
                color,
                date: formattedDate
            };
        } else {
            // Validate amount against available balance
            if (amount > accountData.availableBalance) {
                alert(`You can only segregate up to ₹${accountData.availableBalance.toLocaleString()} (your available balance)`);
                return;
            }
            
            // Create new category
            const newCategory = {
                name,
                amount,
                color,
                date: formattedDate
            };
            
            // Add to data
            accountData.categories.push(newCategory);
            
            // Update available balance
            accountData.availableBalance -= amount;
        }
        
        // Save to local storage
        saveToLocalStorage();
        
        // Update UI
        renderCategories();
        updateBalanceDisplay();
        
        // Reset and close form
        categoryForm.reset();
        categoryModal.style.display = 'none';
        
        // Animate the chart
        animateChartUpdate();
    });
    
    // Filter colors when color dropdown is focused
    document.getElementById('categoryColor').addEventListener('focus', filterUsedColors);

    // Reset session button event listener
    resetSessionBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the session? All data will be lost.')) {
            accountData = { ...defaultAccountData };
            saveToLocalStorage();
            renderCategories();
            updateBalanceDisplay();
            animateChartUpdate();
        }
    });

    // Random data generation button event listener
    randomDataBtn.addEventListener('click', () => {
        // Generate random categories
        const randomCategories = generateRandomCategories();
        
        // Calculate total of all categories
        const totalAllocated = randomCategories.reduce((sum, category) => sum + category.amount, 0);
        
        // Set a reasonable total balance (sum of categories + random available amount)
        const randomAvailable = Math.floor(Math.random() * 10000) + 5000; // 5000-15000 random available balance
        const newTotalBalance = totalAllocated + randomAvailable;
        
        // Update account data
        accountData.categories = randomCategories;
        accountData.totalBalance = newTotalBalance;
        accountData.availableBalance = randomAvailable; // This is the correct available balance
        
        // Save to local storage
        saveToLocalStorage();
        
        // Update UI
        renderCategories();
        updateBalanceDisplay();
        animateChartUpdate();
    });
}

// Get total allocated amount across all categories
function getTotalAllocated() {
    return accountData.categories.reduce((sum, category) => sum + category.amount, 0);
}

// Format date object to string (e.g., "April 15, 2025")
function getFormattedDateFromObject(dateObj) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
}

// Get formatted date X days from now (kept for backward compatibility)
function getFormattedDate(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Animate chart update when adding a new category
function animateChartUpdate() {
    // Add animation class to chart container
    const chartContainer = document.querySelector('.chart-container');
    chartContainer.classList.add('chart-animation');
    
    // Update chart data
    const chartData = prepareChartData();
    balanceChart.data.labels = chartData.labels;
    balanceChart.data.datasets[0].data = chartData.data;
    balanceChart.data.datasets[0].backgroundColor = chartData.colors;
    
    // Create a custom animation
    balanceChart.update('none'); // Update without animation first
    
    // Then manually animate the segment
    setTimeout(() => {
        // Apply pop-out effect to the latest added segment
        balanceChart.update({
            duration: 500,
            easing: 'easeOutBack'
        });
        
        // Remove animation class after animation completes
        setTimeout(() => {
            chartContainer.classList.remove('chart-animation');
        }, 500);
    }, 10);
}

// Generate random categories for testing
function generateRandomCategories() {
    const randomCategories = [];
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#2ECC71', '#9966FF'];
    const names = ['Food', 'Transport', 'Utilities', 'Movies', 'Misc'];
    
    for (let i = 0; i < 5; i++) {
        const amount = Math.floor(Math.random() * 5000) + 1000;
        const color = colors[i];
        const name = names[i];
        const date = getFormattedDate(Math.floor(Math.random() * 30) + 1);
        
        randomCategories.push({ name, amount, color, date });
    }
    
    return randomCategories;
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initialize);
// Initial account data
let accountData = {
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

// DOM Elements
const categoriesContainer = document.querySelector('.categories');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const categoryModal = document.getElementById('categoryModal');
const closeModalBtn = document.querySelector('.close-modal');
const categoryForm = document.getElementById('categoryForm');
const availableBalanceElement = document.querySelector('.available');

// Chart instance
let balanceChart;

// Initialize the application
function initialize() {
    renderCategories();
    initializeChart();
    setupEventListeners();
    updateAvailableBalance();
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

// Render category cards
function renderCategories() {
    categoriesContainer.innerHTML = '';
    
    accountData.categories.forEach(category => {
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
        `;
        
        categoriesContainer.appendChild(categoryCard);
    });
}

// Update the available balance display
function updateAvailableBalance() {
    availableBalanceElement.textContent = `₹${accountData.availableBalance.toLocaleString()}`;
}

// Set up event listeners
function setupEventListeners() {
    // Open modal when add category button is clicked
    addCategoryBtn.addEventListener('click', () => {
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
    });
    
    // Handle form submission
    categoryForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        // Get form values
        const name = document.getElementById('categoryName').value;
        const amount = parseFloat(document.getElementById('categoryAmount').value);
        const color = document.getElementById('categoryColor').value;
        
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
            date: getFormattedDate(30) // Set a default date 30 days from now
        };
        
        // Add to data
        accountData.categories.push(newCategory);
        
        // Update available balance
        accountData.availableBalance -= amount;
        
        // Update UI
        renderCategories();
        updateAvailableBalance();
        
        // Reset and close form
        categoryForm.reset();
        categoryModal.style.display = 'none';
        
        // Animate the chart when adding a new category
        animateChartUpdate();
    });
}

// Get formatted date X days from now
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
    
    // Animate the specific segment that was added (the newest category)
    const newCategoryIndex = accountData.categories.length - 1;
    
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

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initialize);
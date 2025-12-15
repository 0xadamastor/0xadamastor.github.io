function escapeHtml(unsafe) {
    const div = document.createElement('div');
    div.textContent = unsafe;
    return div.innerHTML;
}

const statusElement = document.getElementById('status');
let welcomeMessages = [];
let currentMessageIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingTimeout;

async function loadWelcomeMessages() {
    try {
        const response = await fetch('welcomeMessages/welcomeMessages');
        const text = await response.text();
        welcomeMessages = text.split('\n').filter(line => line.trim());
        if (welcomeMessages.length > 0) {
            currentMessageIndex = Math.floor(Math.random() * welcomeMessages.length);
            setTimeout(() => typeWriter(), 300);
        }
    } catch (error) {
        welcomeMessages = ['I buged my welcome messages file!'];
        setTimeout(() => typeWriter(), 300);
    }
}

function typeWriter() {
    const baseText = '> online | ';
    const currentMessage = welcomeMessages[currentMessageIndex];
    
    statusElement.textContent = '';
    
    const baseSpan = document.createTextNode(baseText);
    statusElement.appendChild(baseSpan);
    
    if (!isDeleting) {
        if (charIndex <= currentMessage.length) {
            const textNode = document.createTextNode(currentMessage.substring(0, charIndex));
            statusElement.appendChild(textNode);
            
            const cursor = document.createElement('span');
            cursor.className = 'cursor';
            cursor.textContent = '_';
            statusElement.appendChild(cursor);
            
            charIndex++;
            typingTimeout = setTimeout(typeWriter, 80 + Math.random() * 40);
        } else {
            const textNode = document.createTextNode(currentMessage);
            statusElement.appendChild(textNode);
            
            const cursor = document.createElement('span');
            cursor.className = 'cursor blink';
            cursor.textContent = '_';
            statusElement.appendChild(cursor);
            
            typingTimeout = setTimeout(() => {
                isDeleting = true;
                charIndex = currentMessage.length;
                typeWriter();
            }, 2500);
        }
    } else {
        if (charIndex > 0) {
            charIndex--;
            const textNode = document.createTextNode(currentMessage.substring(0, charIndex));
            statusElement.appendChild(textNode);
            
            const cursor = document.createElement('span');
            cursor.className = 'cursor';
            cursor.textContent = '_';
            statusElement.appendChild(cursor);
            
            typingTimeout = setTimeout(typeWriter, 50 + Math.random() * 30);
        } else {
            const cursor = document.createElement('span');
            cursor.className = 'cursor';
            cursor.textContent = '_';
            statusElement.appendChild(cursor);
            
            isDeleting = false;
            charIndex = 0;
            currentMessageIndex = Math.floor(Math.random() * welcomeMessages.length);
            typingTimeout = setTimeout(typeWriter, 800);
        }
    }
}

loadWelcomeMessages();

async function loadSkills() {
    try {
        const response = await fetch('skills/skills');
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        const skillsByCategory = {};
        const categories = new Set();
        
        lines.forEach(line => {
            const parts = line.split('_-_');
            if (parts.length === 3) {
                const category = parts[0].trim();
                const name = parts[1].trim();
                const level = parseInt(parts[2].trim());
                
                if (!skillsByCategory[category]) {
                    skillsByCategory[category] = [];
                }
                skillsByCategory[category].push({ name, level });
                categories.add(category);
            }
        });
        
        const categoriesDiv = document.querySelector('.skill-categories');
        categoriesDiv.innerHTML = '<button class="category-btn active" data-category="all">> all</button>';
        Array.from(categories).sort().forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.dataset.category = cat;
            btn.textContent = `> ${cat}`;
            categoriesDiv.appendChild(btn);
        });
        
        const skillsGrid = document.querySelector('.skills-grid');
        skillsGrid.innerHTML = '';
        
        Object.keys(skillsByCategory).sort().forEach(category => {
            skillsByCategory[category].forEach(skill => {
                const safeLevel = Math.max(0, Math.min(100, skill.level || 0));
                const item = document.createElement('div');
                item.className = 'skill-item';
                item.dataset.category = category;
                
                const nameSpan = document.createElement('span');
                nameSpan.className = 'skill-name';
                nameSpan.textContent = `> ${skill.name}`;
                
                const levelDiv = document.createElement('div');
                levelDiv.className = 'skill-level';
                const barDiv = document.createElement('div');
                barDiv.className = 'skill-bar';
                barDiv.style.width = `${safeLevel}%`;
                levelDiv.appendChild(barDiv);
                
                item.appendChild(nameSpan);
                item.appendChild(levelDiv);
                skillsGrid.appendChild(item);
            });
        });
        
        setTimeout(() => setupSkillFilters(), 0);
    } catch (error) {
        console.error('Error loading skills:', error);
    }
}

function setupSkillFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const skillItems = document.querySelectorAll('.skill-item');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            skillItems.forEach((item, index) => {
                if (category === 'all' || item.dataset.category === category) {
                    setTimeout(() => {
                        item.classList.remove('hidden');
                        item.style.animation = 'fadeInUp 0.4s ease forwards';
                    }, index * 30);
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });
}

loadSkills();

const modal = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');
const modalClose = document.querySelector('.modal-close');

async function loadCertificates() {
    try {
        const response = await fetch('certs/certs');
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        const certs = {};
        const certList = document.querySelector('.cert-list');
        certList.innerHTML = '';
        
        lines.forEach(line => {
            const parts = line.split('_-_');
            if (parts.length === 3 || parts.length === 4) {
                const id = parts[0].trim();
                const name = parts[1].trim();
                const file = parts[2].trim().replace(/[^a-zA-Z0-9._-]/g, '');
                let description = parts.length === 4 ? parts[3].trim() : '';
                
                if (description.length > 500) {
                    description = description.substring(0, 500);
                }
                
                if (!file || file.includes('..')) return;
                
                const certId = id.toLowerCase();
                certs[certId] = {
                    name: `${id} - ${name}`,
                    file: `certs/${file}`,
                    description: description
                };
                
                const certDiv = document.createElement('div');
                certDiv.className = 'cert-item cert-clickable';
                certDiv.dataset.cert = certId;
                
                const nameSpan = document.createElement('span');
                nameSpan.className = 'cert-name';
                nameSpan.textContent = `> ${id} - ${name}`;
                
                const hintSpan = document.createElement('span');
                hintSpan.className = 'cert-hint';
                hintSpan.textContent = 'click to view';
                
                certDiv.appendChild(nameSpan);
                certDiv.appendChild(hintSpan);
                certList.appendChild(certDiv);
            }
        });
        
        document.querySelectorAll('.cert-clickable').forEach(cert => {
            cert.addEventListener('click', () => {
                const certId = cert.dataset.cert;
                const data = certs[certId];
                
                if (data) {
                    const modalContent = document.createElement('div');
                    
                    const title = document.createElement('div');
                    title.className = 'modal-title';
                    title.textContent = data.name;
                    
                    if (data.description) {
                        const desc = document.createElement('div');
                        desc.className = 'modal-description';
                        desc.textContent = data.description;
                        modalContent.appendChild(title);
                        modalContent.appendChild(desc);
                    } else {
                        modalContent.appendChild(title);
                    }
                    
                    const embed = document.createElement('embed');
                    embed.className = 'modal-embed';
                    embed.src = data.file;
                    embed.type = 'application/pdf';
                    
                    modalContent.appendChild(embed);
                    modalBody.innerHTML = '';
                    modalBody.appendChild(modalContent);
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });
    } catch (error) {
        console.error('Error loading certificates:', error);
    }
}

loadCertificates();

function openModal(content) {
    modalBody.innerHTML = content;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

let allRepos = [];
let currentSort = 'stars';
let contributedRepos = new Set();

async function loadContributedRepos() {
    try {
        const response = await fetch('gitContributions/repos');
        const text = await response.text();
        const urls = text.split('\n').filter(line => line.trim());
        urls.forEach(url => {
            try {
                const urlObj = new URL(url);
                if (urlObj.hostname !== 'github.com') return;
                const match = url.match(/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9._-]+)/);
                if (match) {
                    contributedRepos.add(`${match[1]}/${match[2]}`);
                }
            } catch (e) {
                console.warn('Invalid URL:', url);
            }
        });
    } catch (error) {
        console.error('Failed to load contributed repos');
    }
}

async function fetchGitHubProjects() {
    const container = document.getElementById('projects-container');
    container.innerHTML = '<div class="loading">> loading projects...</div>';
    
    try {
        await loadContributedRepos();
        
        const ownResponse = await fetch('https://api.github.com/users/0xadamastor/repos?per_page=100');
        if (!ownResponse.ok) throw new Error('Failed to fetch repositories');
        
        const ownRepos = await ownResponse.json();
        
        const contributedPromises = Array.from(contributedRepos).map(async repoName => {
            try {
                const res = await fetch(`https://api.github.com/repos/${repoName}`);
                if (res.ok) {
                    const repo = await res.json();
                    repo.isContributed = true;
                    return repo;
                }
            } catch (e) {
                return null;
            }
        });
        
        const contributedReposData = (await Promise.all(contributedPromises)).filter(r => r !== null);
        
        allRepos = [...ownRepos, ...contributedReposData];
        
        displayProjects();
        
    } catch (error) {
        console.error('Error fetching repositories:', error);
        container.innerHTML = '<div class="loading">> failed to load projects</div>';
    }
}

function displayProjects() {
    const container = document.getElementById('projects-container');
    
    if (allRepos.length === 0) {
        container.innerHTML = '<div class="loading">> no repositories found</div>';
        return;
    }
    
    let sortedRepos = [...allRepos];
    
    if (currentSort === 'stars') {
        sortedRepos.sort((a, b) => {
            if (b.stargazers_count !== a.stargazers_count) {
                return b.stargazers_count - a.stargazers_count;
            }
            return new Date(b.updated_at) - new Date(a.updated_at);
        });
    } else if (currentSort === 'recent') {
        sortedRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }
    
    const limit = currentSort === 'all' ? sortedRepos.length : 6;
    sortedRepos = sortedRepos.slice(0, limit);
    
    container.innerHTML = '';
    
    sortedRepos.forEach((repo, index) => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        const name = document.createElement('div');
        name.className = 'project-name';
        name.textContent = `> ${repo.name}`;
        
        const desc = document.createElement('div');
        desc.className = 'project-desc';
        desc.textContent = repo.description || 'No description available';
        
        const meta = document.createElement('div');
        meta.className = 'project-meta';
        
        const stars = document.createElement('span');
        stars.textContent = `${repo.stargazers_count} stars`;
        
        const updated = document.createElement('span');
        const date = new Date(repo.updated_at);
        updated.textContent = `updated ${date.toLocaleDateString()}`;
        
        meta.appendChild(stars);
        meta.appendChild(updated);
        
        const link = document.createElement('a');
        try {
            const url = new URL(repo.html_url);
            if (url.hostname === 'github.com') {
                link.href = repo.html_url;
            } else {
                link.href = '#';
            }
        } catch (e) {
            link.href = '#';
        }
        link.target = '_blank';
        link.className = 'project-link';
        link.textContent = '> view on github';
        
        card.appendChild(name);
        card.appendChild(desc);
        card.appendChild(meta);
        card.appendChild(link);
        
        container.appendChild(card);
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentSort = btn.dataset.sort;
        document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        displayProjects();
    });
});

fetchGitHubProjects();

async function loadPaths() {
    try {
        const response = await fetch('paths/paths');
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        const timeline = document.querySelector('.timeline');
        timeline.innerHTML = '';
        
        lines.forEach(line => {
            const parts = line.split('_-_');
            if (parts.length === 2) {
                const date = parts[0].trim();
                const desc = parts[1].trim();
                
                const item = document.createElement('div');
                item.className = 'timeline-item';
                
                const dateSpan = document.createElement('span');
                dateSpan.className = 'timeline-date';
                dateSpan.textContent = `> ${date}`;
                
                const descSpan = document.createElement('span');
                descSpan.className = 'timeline-desc';
                descSpan.textContent = desc;
                
                item.appendChild(dateSpan);
                item.appendChild(descSpan);
                timeline.appendChild(item);
            }
        });
    } catch (error) {
        console.error('Error loading paths:', error);
    }
}

loadPaths();

async function loadWorkingOn() {
    try {
        const response = await fetch('workingOn/workingOn');
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        const grid = document.querySelector('.current-grid');
        grid.innerHTML = '';
        
        lines.forEach(line => {
            const parts = line.split('_-_');
            if (parts.length === 2) {
                const label = parts[0].trim();
                const value = parts[1].trim();
                
                const item = document.createElement('div');
                item.className = 'current-item';
                
                const labelSpan = document.createElement('span');
                labelSpan.className = 'current-label';
                labelSpan.textContent = `> ${label}`;
                
                const valueSpan = document.createElement('span');
                valueSpan.className = 'current-value';
                valueSpan.textContent = value;
                
                item.appendChild(labelSpan);
                item.appendChild(valueSpan);
                grid.appendChild(item);
            }
        });
    } catch (error) {
        console.error('Error loading working on:', error);
    }
}

loadWorkingOn();

const milestoneDataMap = new WeakMap();

async function loadMilestones() {
    const grid = document.getElementById('milestones-grid');
    
    try {
        const response = await fetch('milestones/milestones');
        const text = await response.text();
        const files = text.split('\n').filter(line => line.trim() !== '');
        
        const milestones = files.map(line => {
            if (line.length > 300) return null;
            
            const parts = line.split('_-_');
            if (parts.length < 2) return null;
            
            const caption = parts[0].trim();
            const dateAndExt = parts[1].trim();
            let description = parts.length === 3 ? parts[2].trim() : '';
            
            if (description.length > 500) {
                description = description.substring(0, 500);
            }
            
            const match = dateAndExt.match(/^(\d{1,2})-(\d{1,2})-(\d{4})\.(jpg|jpeg|png|gif|pdf)$/i);
            if (match) {
                const [_, day, month, year, ext] = match;
                const paddedMonth = month.padStart(2, '0');
                const paddedDay = day.padStart(2, '0');
                
                const safeFilename = `${caption}_-_${day}-${month}-${year}.${ext}`.replace(/[^a-zA-Z0-9._\-\s]/g, '');
                if (!safeFilename || safeFilename.includes('..')) return null;
                
                const safeCaption = caption.replace(/[^a-zA-Z0-9 _-]/g, '');
                
                return {
                    file: `milestones/${safeFilename}`,
                    caption: safeCaption,
                    description: description,
                    year: year,
                    date: `${paddedDay}-${paddedMonth}-${year}`,
                    sortDate: `${year}-${paddedMonth}-${paddedDay}`
                };
            }
            return null;
        }).filter(m => m !== null);
        
        if (milestones.length === 0) {
            grid.innerHTML = '<p style="color: #555; text-align: center;">no milestones yet</p>';
            return;
        }
        
        milestones.sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));
        
        grid.innerHTML = '';
        
        milestones.forEach((milestone, index) => {
            const item = document.createElement('div');
            item.className = 'milestone-item';
            milestoneDataMap.set(item, milestone);
            
            const thumbnail = document.createElement('div');
            thumbnail.className = 'milestone-thumbnail';
            
            if (milestone.file.toLowerCase().endsWith('.pdf')) {
                const pdfIcon = document.createElement('div');
                pdfIcon.className = 'pdf-icon';
                pdfIcon.textContent = 'PDF';
                thumbnail.appendChild(pdfIcon);
            } else {
                const img = document.createElement('img');
                img.src = milestone.file;
                img.alt = milestone.caption;
                img.className = 'milestone-img';
                thumbnail.appendChild(img);
            }
            
            const info = document.createElement('div');
            info.className = 'milestone-info';
            
            const yearDiv = document.createElement('div');
            yearDiv.className = 'milestone-year';
            yearDiv.textContent = milestone.year;
            
            const captionDiv = document.createElement('div');
            captionDiv.className = 'milestone-caption';
            captionDiv.textContent = milestone.caption;
            
            info.appendChild(yearDiv);
            info.appendChild(captionDiv);
            item.appendChild(thumbnail);
            item.appendChild(info);
            grid.appendChild(item);
        });
        
        document.querySelectorAll('.milestone-item').forEach(item => {
            item.addEventListener('click', function() {
                openMilestoneModal(milestoneDataMap.get(this));
            });
        });
    } catch (error) {
        console.error('Error loading milestones:', error);
        grid.innerHTML = '<p style="color: #555; text-align: center;">failed to load milestones</p>';
    }
}

function openMilestoneModal(milestone) {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = '';
    
    const isPdf = milestone.file.toLowerCase().endsWith('.pdf');
    
    const title = document.createElement('div');
    title.className = 'modal-title';
    title.textContent = `> ${milestone.year} - ${milestone.caption}`;
    
    modalBody.appendChild(title);
    
    if (milestone.description) {
        const desc = document.createElement('div');
        desc.className = 'modal-description';
        desc.textContent = milestone.description;
        modalBody.appendChild(desc);
    }
    
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.maxWidth = '900px';
    
    if (isPdf) {
        const embed = document.createElement('embed');
        embed.src = milestone.file;
        embed.type = 'application/pdf';
        embed.style.width = '100%';
        embed.style.height = '600px';
        embed.style.border = '1px solid #333';
        wrapper.appendChild(embed);
    } else {
        const img = document.createElement('img');
        img.src = milestone.file;
        img.alt = milestone.caption;
        img.style.width = '100%';
        img.style.border = '1px solid #333';
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => window.open(milestone.file, '_blank'));
        wrapper.appendChild(img);
    }
    
    const dateStamp = document.createElement('div');
    dateStamp.className = 'milestone-date-stamp';
    dateStamp.textContent = milestone.date;
    wrapper.appendChild(dateStamp);
    
    modalBody.appendChild(wrapper);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

loadMilestones();

document.querySelectorAll('.nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    });
});

const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav a');

function highlightNavigation() {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 250)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        if (linkHref && linkHref.substring(1) === current) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', highlightNavigation);
highlightNavigation();

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
        }
    });
}, observerOptions);

const revealElements = document.querySelectorAll('.section-title, .info-box, .focus-item, .skill-item, .cert-item, .project-card, .timeline-item, .current-item, .milestone-item');
revealElements.forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
});
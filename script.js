document.addEventListener("DOMContentLoaded", () => {
    // Inject structural configuration parameters right out of the gate
    document.getElementById("nav-server-name").innerText = CONFIG.serverName;
    document.getElementById("card-ip-text").innerText = CONFIG.serverIp;
    
    // Fire up structural loops
    initializeLucide();
    queryServerMatrix();
    setInterval(queryServerMatrix, CONFIG.refreshInterval);
});

// Icon injection lifecycle controller
function initializeLucide() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// System Dashboard Status Matrix Handler
async function queryServerMatrix() {
    try {
        // Upgraded pipeline pointing to the new mcstatus.io engine
        const response = await fetch(`https://api.mcstatus.io/v2/status/java/${CONFIG.serverIp}`);
        
        if (!response.ok) throw new Error("API Route Failure");
        const data = await response.json();
        
        updateDashboardView(data);
    } catch (error) {
        console.error("Matrix Processing Error:", error);
        flagDashboardOffline();
    }
}

// Distribute data payloads into front-end visual structures
function updateDashboardView(data) {
    const statusTitle = document.getElementById("card-status-title");
    const statusIconContainer = document.getElementById("status-icon-container");
    const motdContainer = document.getElementById("motd-container");
    const onlineCount = document.getElementById("online-count");
    const maxCount = document.getElementById("max-count");
    const progressBar = document.getElementById("player-progress-bar");
    const progressPercent = document.getElementById("progress-percentage");
    
    const playerListContainer = document.getElementById("player-list-container");
    const playerNamesGrid = document.getElementById("player-names-grid");

    const globalPulse = document.getElementById("global-pulse");
    const globalStatusText = document.getElementById("global-status-text");

    if (data.online) {
        // Handle Global Operational States
        globalPulse.className = "h-2 w-2 rounded-full bg-emerald-500 animate-pulse";
        globalStatusText.innerText = "All Networks Nominal";
        globalStatusText.className = "text-emerald-400 font-semibold";

        // Update Central Widget Layouts
        statusTitle.innerText = "Operational";
        statusTitle.className = "text-2xl font-bold mt-1 text-emerald-400";
        statusIconContainer.className = "p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20";
        statusIconContainer.innerHTML = `<i data-lucide="zap" class="w-6 h-6"></i>`;

        // mcstatus.io provides flat clean strings out-of-the-box
        motdContainer.innerText = data.motd?.clean || "Welcome to the sandbox cluster server.";

        // Calculate and push statistical information blocks
        const current = data.players?.online || 0;
        const cap = data.players?.max || 0;
        const ratio = cap > 0 ? (current / cap) * 100 : 0;

        onlineCount.innerText = current;
        maxCount.innerText = `/ ${cap} active`;
        progressBar.style.width = `${ratio}%`;
        progressPercent.innerText = `${Math.round(ratio)}%`;

        // Render Online Roster Names
        playerNamesGrid.innerHTML = "";
        if (data.players?.list && data.players.list.length > 0) {
            playerListContainer.classList.remove("hidden");
            
            data.players.list.forEach(player => {
                const username = player.name_clean || player.name || "Player";
                const uuid = player.uuid || "069a79f444e94726a5befca90e38aaf5"; // Default fallback Steve UUID

                const tagElement = document.createElement("div");
                tagElement.className = "flex items-center gap-2 p-1.5 rounded-xl bg-zinc-950/60 border border-zinc-900 text-xs text-zinc-300 font-medium group hover:border-zinc-800 transition-colors";
                tagElement.innerHTML = `
                    <img src="https://crafthead.net/avatar/${uuid}/24" class="w-4 h-4 rounded-md bg-zinc-900 group-hover:scale-105 transition-transform" alt="${username}">
                    <span class="truncate tracking-wide">${username}</span>
                `;
                playerNamesGrid.appendChild(tagElement);
            });
        } else {
            playerListContainer.classList.add("hidden");
        }
    } else {
        flagDashboardOffline();
    }
    initializeLucide();
}

// Transition dashboard state components to a safe fallback design
function flagDashboardOffline() {
    const globalPulse = document.getElementById("global-pulse");
    const globalStatusText = document.getElementById("global-status-text");
    
    globalPulse.className = "h-2 w-2 rounded-full bg-rose-500";
    globalStatusText.innerText = "Master Link Server Disconnected";
    globalStatusText.className = "text-rose-400 font-semibold";

    document.getElementById("card-status-title").innerText = "Offline";
    document.getElementById("card-status-title").className = "text-2xl font-bold mt-1 text-rose-500";
    
    const iconContainer = document.getElementById("status-icon-container");
    iconContainer.className = "p-3 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20";
    iconContainer.innerHTML = `<i data-lucide="shield-alert" class="w-6 h-6"></i>`;

    document.getElementById("motd-container").innerText = "The target node dropped requests. Undergoing diagnostic sequence.";
    document.getElementById("online-count").innerText = "0";
    document.getElementById("max-count").innerText = "/ 0 active";
    document.getElementById("player-progress-bar").style.width = "0%";
    document.getElementById("progress-percentage").innerText = "0%";
    
    // Wipe out data rosters on overall drop cycles
    document.getElementById("player-list-container").classList.add("hidden");

    initializeLucide();
}

// Copy to Clipboard Action Controller
function copyServerIp() {
    const ipCard = document.getElementById("ip-card");
    const copyIconBox = document.getElementById("copy-icon-box");
    const copyTooltip = document.getElementById("copy-tooltip");

    navigator.clipboard.writeText(CONFIG.serverIp).then(() => {
        ipCard.classList.add("border-emerald-500/80", "bg-emerald-950/10");
        copyIconBox.className = "p-2.5 bg-emerald-500 text-zinc-950 rounded-xl transition-all scale-105";
        copyIconBox.innerHTML = `<i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>`;
        copyTooltip.innerHTML = `<i data-lucide="sparkles" class="w-3 h-3 text-emerald-400"></i> String cloned onto host clipboard!`;
        copyTooltip.classList.remove("text-zinc-500");
        copyTooltip.classList.add("text-emerald-400", "font-medium");
        
        initializeLucide();

        setTimeout(() => {
            ipCard.classList.remove("border-emerald-500/80", "bg-emerald-950/10");
            copyIconBox.className = "p-2.5 bg-zinc-800/50 rounded-xl text-zinc-400 group-hover:text-white transition-all";
            copyIconBox.innerHTML = `<i data-lucide="copy" class="w-4 h-4"></i>`;
            copyTooltip.innerHTML = `<i data-lucide="mouse-pointer-click" class="w-3 h-3"></i> Click anywhere on this card to instantly copy`;
            copyTooltip.classList.remove("text-emerald-400", "font-medium");
            copyTooltip.classList.add("text-zinc-500");
            initializeLucide();
        }, 2200);
    }).catch(err => {
        console.error('Copy pipeline processing exception encountered: ', err);
    });
}

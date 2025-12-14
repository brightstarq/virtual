<?php
/***** Theme setup stuff *****/
$mh_magazine_data = wp_get_theme('mh-magazine');
$mh_magazine_version = $mh_magazine_data['Version'];
$mh_magazine_child_data = wp_get_theme('mh-magazine-child');
$mh_magazine_child_version = $mh_magazine_child_data['Version'];

function mh_magazine_child_styles() {
	global $mh_magazine_version, $mh_magazine_child_version;
    wp_enqueue_style('mh-magazine', get_template_directory_uri() . '/style.css', array(), $mh_magazine_version);
    wp_enqueue_style('mh-magazine-child', get_stylesheet_uri(), array(), $mh_magazine_child_version);

    if (is_rtl()) {
		wp_enqueue_style('mh-magazine-rtl', get_template_directory_uri() . '/rtl.css', array(), $mh_magazine_version);
	}

    // ✅ Correct child script path
	wp_enqueue_script(
        'mh-child-custom',
        get_stylesheet_directory_uri() . '/custom-script.js',
        array('jquery'),
        $mh_magazine_child_version,
        true
    );
}
add_action('wp_enqueue_scripts', 'mh_magazine_child_styles');

add_action('admin_enqueue_scripts', function() use ($mh_magazine_child_version) {
	wp_enqueue_script(
        'mh-child-custom',
        get_stylesheet_directory_uri() . '/custom-script.js',
        array('jquery'),
        $mh_magazine_child_version,
        true
    );
	wp_enqueue_style('mh-magazine-child', get_stylesheet_uri(), array(), $mh_magazine_child_version);
});

/***** Remove big image sizes *****/
add_action('after_setup_theme', 'remove_plugin_image_sizes', 999);
function remove_plugin_image_sizes(){
  remove_image_size('2048x2048');
  remove_image_size('1536x1536');
  remove_image_size('large');
}

/***** Auto-delete thumbnails on trash *****/
add_action('trashed_post', 'mtp_delete_attached_thumbnail_for_trashed_product', 20, 1);
function mtp_delete_attached_thumbnail_for_trashed_product( $post_id ) {
  $post_type = get_post_type( $post_id );
  if ( $post_type != 'post' ) return true;
  $post_thumbnail_id = get_post_thumbnail_id( $post_id );
  if ($post_thumbnail_id) {
    wp_delete_attachment( $post_thumbnail_id, true );
  }
}
/* =================== TAO SUBNETS UI (Responsive with Change % & Logo Fallback) =================== */
function tao_subnet_prices_shortcode($atts = []) {
    $atts = shortcode_atts([
        'limit'   => 128,
        'refresh' => 60,
        'title'   => 'TAO SUBNETS'
    ], $atts, 'taosubnets');

    $id       = 'tao-subnets-' . wp_generate_password(6, false, false);
    $ajax_url = admin_url('admin-ajax.php');
    $refresh  = max(10, (int)$atts['refresh']) * 1000;

    ob_start(); ?>
<div id="<?php echo esc_attr($id); ?>" class="tao-list-wrap">
  <div class="tao-head"><?php echo esc_html($atts['title']); ?></div>
  <ul class="tao-list"><li class="tao-row"></li></ul>
</div>


<style>

/* ===== ULTRA-MODERN TAO SUBNETS WIDGET ===== */
.tao-subnets-widget {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0a0a0a;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 24px;
    padding: 0;
    box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.03);
    position: relative;
    overflow: hidden;
    max-width: 100%;
}

/* Animated Grid Background */
.tao-subnets-widget::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: 
        linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 30px 30px;
    opacity: 0.5;
    pointer-events: none;
    z-index: 0;
    animation: grid-move 20s linear infinite;
}

@keyframes grid-move {
    0% { background-position: 0 0; }
    100% { background-position: 30px 30px; }
}

/* Rainbow Top Border */
.tao-subnets-widget::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, 
        transparent 0%,
        #00d9ff 15%,
        #7b61ff 35%,
        #ff006b 55%,
        #ffd700 75%,
        transparent 100%);
    background-size: 200% 100%;
    animation: rainbow-slide 4s linear infinite;
    z-index: 2;
}

@keyframes rainbow-slide {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* Header Section */
.tao-subnets-widget h3 {
    position: relative;
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 4px;
    margin: 0;
    padding: 32px;
    color: transparent;
    background: linear-gradient(135deg, #00d9ff 0%, #7b61ff 50%, #ff006b 100%);
    background-clip: text;
    -webkit-background-clip: text;
    text-transform: uppercase;
    z-index: 1;
    animation: text-glow 3s ease-in-out infinite;
}

@keyframes text-glow {
    0%, 100% { filter: drop-shadow(0 0 10px rgba(0, 217, 255, 0.5)); }
    50% { filter: drop-shadow(0 0 20px rgba(123, 97, 255, 0.8)); }
}

/* Subnet List Container */
.tao-subnet-list {
    max-height: 600px;
    overflow-y: auto;
    padding: 24px;
    position: relative;
    z-index: 1;
}

/* Custom Scrollbar - Neon Style */
.tao-subnet-list::-webkit-scrollbar {
    width: 10px;
}

.tao-subnet-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 10px;
}

.tao-subnet-list::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #00d9ff, #7b61ff);
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
}

.tao-subnet-list::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #7b61ff, #ff006b);
    box-shadow: 0 0 15px rgba(255, 0, 107, 0.8);
}

/* Subnet Item Card */
.tao-subnet-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    margin-bottom: 12px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    cursor: pointer;
}

/* Glow Effect on Hover */
.tao-subnet-item::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
        800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(0, 217, 255, 0.12),
        transparent 40%
    );
    opacity: 0;
    transition: opacity 0.4s;
    pointer-events: none;
}

.tao-subnet-item:hover::before {
    opacity: 1;
}

/* Animated Border on Hover */
.tao-subnet-item::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 16px;
    padding: 2px;
    background: linear-gradient(135deg, 
        rgba(0, 217, 255, 0.4),
        rgba(123, 97, 255, 0.4),
        rgba(255, 0, 107, 0.4)
    );
    -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
    mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.4s;
    pointer-events: none;
}

.tao-subnet-item:hover::after {
    opacity: 1;
    animation: border-pulse 2s ease-in-out infinite;
}

@keyframes border-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.tao-subnet-item:hover {
    transform: translateX(8px) scale(1.02);
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(0, 217, 255, 0.3);
    box-shadow: 
        0 10px 40px rgba(0, 0, 0, 0.3),
        0 0 20px rgba(0, 217, 255, 0.2);
}

/* Status Indicator Dot */
.tao-subnet-item:hover .tao-logo-wrapper::after {
    content: '';
    position: absolute;
    top: -4px;
    right: -4px;
    width: 12px;
    height: 12px;
    background: #00ff88;
    border-radius: 50%;
    box-shadow: 0 0 15px #00ff88;
    animation: pulse-dot 1.5s ease-in-out infinite;
}

@keyframes pulse-dot {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.7; }
}

/* Logo Container */
.tao-logo-wrapper {
    flex-shrink: 0;
    position: relative;
}

.tao-logo {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    object-fit: contain;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    padding: 6px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.tao-subnet-item:hover .tao-logo {
    transform: rotate(5deg) scale(1.1);
    border-color: rgba(0, 217, 255, 0.5);
    box-shadow: 
        0 8px 24px rgba(0, 0, 0, 0.4),
        0 0 20px rgba(0, 217, 255, 0.4);
}

/* Info Section */
.tao-subnet-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 0;
}

/* Subnet ID Badge */
.tao-subnet-id {
    font-size: 12px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.05);
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    min-width: 60px;
    text-align: center;
    transition: all 0.3s ease;
    letter-spacing: 1px;
}

.tao-subnet-item:hover .tao-subnet-id {
    background: linear-gradient(135deg, rgba(0, 217, 255, 0.2), rgba(123, 97, 255, 0.2));
    border-color: rgba(0, 217, 255, 0.4);
    color: #00d9ff;
    box-shadow: 0 0 15px rgba(0, 217, 255, 0.3);
}

/* Subnet Name */
.tao-subnet-name {
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: all 0.3s ease;
}

.tao-subnet-item:hover .tao-subnet-name {
    color: #ffffff;
    text-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
}

/* Loading State */
.tao-loading {
    text-align: center;
    padding: 60px 20px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
}

.tao-spinner {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top-color: #00d9ff;
    border-right-color: #7b61ff;
    border-bottom-color: #ff006b;
    border-radius: 50%;
    animation: spinner-rotate 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    margin-bottom: 20px;
    box-shadow: 0 0 20px rgba(0, 217, 255, 0.5);
}

@keyframes spinner-rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Error State */
.tao-error {
    text-align: center;
    padding: 40px 20px;
    color: #ff006b;
    font-size: 14px;
    background: rgba(255, 0, 107, 0.1);
    border: 2px solid rgba(255, 0, 107, 0.3);
    border-radius: 16px;
    margin: 20px;
    backdrop-filter: blur(10px);
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .tao-subnets-widget {
        border-radius: 16px;
    }
    
    .tao-subnets-widget h3 {
        padding: 24px 16px;
        font-size: 14px;
        letter-spacing: 3px;
    }
    
    .tao-subnet-list {
        padding: 16px;
        max-height: 500px;
    }
    
    .tao-subnet-item {
        padding: 16px;
        gap: 12px;
    }
    
    .tao-logo {
        width: 40px;
        height: 40px;
    }
    
    .tao-subnet-id {
        font-size: 11px;
        padding: 4px 8px;
        min-width: 50px;
    }
    
    .tao-subnet-name {
        font-size: 14px;
    }
    
    .tao-subnet-item:hover {
        transform: translateX(4px) scale(1.01);
    }
}

/* Reduce Motion for Accessibility */
@media (prefers-reduced-motion: reduce) {
    .tao-subnets-widget *,
    .tao-subnets-widget *::before,
    .tao-subnets-widget *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* Dark Mode Enhancement */
@media (prefers-color-scheme: dark) {
    .tao-subnets-widget {
        box-shadow: 
            0 25px 70px rgba(0, 0, 0, 0.7),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }
}
</style>
<style>
/* ===== Responsive styles for [taosubnets] ===== */
.tao-list-wrap{font-family:Arial,Helvetica,sans-serif; width:100%; max-width:100%;}
.tao-head{font-weight:700;text-transform:uppercase;color:#222;font-size:14px;text-align:center;padding:6px 0;border-bottom:2px solid #f68700;margin-bottom:6px}
.tao-list{list-style:none;margin:0;padding:0;max-height:60vh;overflow-y:auto}
.tao-list li::marker{content:none}
.tao-row{border-bottom:1px solid #eee;font-size:13px}
.tao-row a{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;padding:8px 10px;text-decoration:none;color:inherit}
.tao-row:hover{background:#f9f9f9;cursor:pointer}
.tao-sn{color:#777;font-weight:600;display:flex;align-items:center;flex:0 0 auto}
.tao-name{color:#222;font-weight:600;flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tao-price{color:#222;font-weight:700;flex:0 0 auto}
.tao-change{font-weight:700;flex:0 0 auto}
.tao-up{color:#0a9c39}.tao-down{color:#d33939}
.tao-logo{width:18px;height:18px;border-radius:50%;object-fit:cover;margin-right:6px}
@media (max-width:480px){
  .tao-head{font-size:13px;padding:6px 0;margin-bottom:6px}
  .tao-row{font-size:12px}
  .tao-logo{width:16px;height:16px}
  .tao-row a{padding:8px}
  .tao-name{max-width:50vw}
}
</style>

<script>
(function(){
  const root    = document.getElementById('<?php echo esc_js($id); ?>');
  const listEl  = root.querySelector('.tao-list');
  const ajaxUrl = '<?php echo esc_js($ajax_url); ?>';
  const REFRESH = <?php echo $refresh; ?>;
  const TAO_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bittensor&vs_currencies=usd";

  let taoUsd = null;
  const smallScreen = window.matchMedia('(max-width:480px)').matches;

  // ✅ Logo with fallback SVG (first 3 letters of name)
 // ✅ UPDATED: Accept optional cachedLogoUrl parameter
// ✅ UPDATED: Accept optional cachedLogoUrl parameter
function taoStatsLogo(sn, safeName, cachedLogoUrl){
    const label = (safeName || `SN${sn}`).toString().slice(0,3).toUpperCase();
    const fallbackSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'>"+
      "<circle cx='18' cy='18' r='18' fill='#e5e7eb'/>"+
      "<text x='50%' y='56%' font-family='Arial' font-size='12' text-anchor='middle' fill='#6b7280' font-weight='700'>"+
      label+"</text></svg>"
    )}`;

    // ✅ Use cached logo URL if available, otherwise use fallback
    if (cachedLogoUrl && cachedLogoUrl.trim() !== '') {
        return `<img src="${cachedLogoUrl}" 
                     class="tao-logo"
                     alt="SN${sn} ${safeName}"
                     loading="lazy"
                     onerror="this.onerror=null;this.src='${fallbackSvg}'">`;
    } else {
        return `<img src="${fallbackSvg}" class="tao-logo" alt="SN${sn}">`;
    }
}
  function money(v,dec){ return (v==null)?'—':'$'+Number(v).toFixed(smallScreen ? 4 : 6); }
  function pct(v){ if(v==null||isNaN(v))return'—'; return Number(v).toFixed(2)+'%'; }

  function render(list){
    if(!Array.isArray(list)||!list.length){listEl.innerHTML='<li class="tao-row"></li>';return;}
    listEl.innerHTML=list.map(s=>{
      const up=(s.d1!=null&&Number(s.d1)>=0);
      const cls=up?'tao-up':'tao-down';
      const safeName=String(s.subnet_name||s.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      const url=s.netuid||s.sn?`https://tao.app/subnets/${s.netuid||s.sn}`:'#';
      const usdPrice=(s.price&&taoUsd)?s.price*taoUsd:null;
      const netuid = s.netuid || s.sn;

      return `<li class="tao-row"><a href="${url}" target="_blank" rel="noopener">
<span class="tao-sn">${taoStatsLogo(netuid, safeName, s.logo_url)}SN#${netuid}</span>
      
        <span class="tao-name">${safeName||'N/A'}</span>
        <span class="tao-price">${money(usdPrice,6)}</span>
        
      </a></li>`;
    }).join('');
  }

  async function load(){
    try{
      // Get TAO/USD price from CoinGecko
      if(!taoUsd){
        const resTao=await fetch(TAO_URL);
        const dataTao=await resTao.json();
        taoUsd=dataTao?.bittensor?.usd||null;
      }

      // ✅ UPDATED: Use WordPress cached proxy instead of motionwebbuilder
      const formData = new FormData();
      formData.append('action', 'tao_subnets_proxy');
      
      const res = await fetch(ajaxUrl, {
        method: 'POST',
        body: formData
      });
      
      const result = await res.json();
      
      if (result.success && result.data && result.data.data) {
        render(result.data.data);
      } else {
        listEl.innerHTML='<li class="tao-row"></li>';
      }
    }catch(e){
      console.error('Error loading subnets:', e);
      listEl.innerHTML='<li class="tao-row"></li>';
    }
  }

  load();setInterval(load,REFRESH);
})();
</script>
<?php return ob_get_clean(); }
add_shortcode('taosubnets','tao_subnet_prices_shortcode');




/* ===== TAO Global Header Ticker w/ Logos + Clickable Links (USD Pricing, Responsive) ===== */
add_action('wp_head', function () {
  $ajax_url = admin_url('admin-ajax.php');
  ?>
  <div id="tao-global-ticker" class="tao-ticker-bar">
    <span class="ticker-content"></span>
  </div>
  <style>
    .tao-ticker-bar{
      position:relative; z-index:9999; overflow:hidden; white-space:nowrap;
      background:#111; color:#eee; font-size:13px; padding:4px 0; border-bottom:1px solid #333;
    }
    .tao-ticker-bar .ticker-content{ display:inline-block; padding-left:100%;
      animation:tao-scroll 400s linear infinite; }
    .tao-ticker-bar:hover .ticker-content{ animation-play-state: paused; }
    .tao-ticker-bar a{ display:inline-flex; align-items:center; gap:6px;
      text-decoration:none; color:inherit; margin-right:18px; }
    .tao-ticker-bar img.tao-logo{ width:16px; height:16px; border-radius:50%;
      vertical-align:middle; margin-right:0; }
    .tao-up{color:#0a9c39} .tao-down{color:#d33939}
    @keyframes tao-scroll{ from{transform:translateX(0)} to{transform:translateX(-100%)} }

    /* Mobile adjustments */
    @media (max-width:480px){
      .tao-ticker-bar{font-size:12px; padding:3px 0;}
      .tao-ticker-bar a{margin-right:12px}
      .tao-ticker-bar img.tao-logo{width:14px;height:14px}
    }
  </style>
  <script>
  (function(){
    const ticker  = document.querySelector('#tao-global-ticker .ticker-content');
    const bar     = document.querySelector('#tao-global-ticker');
    const ajaxUrl = '<?php echo esc_js($ajax_url); ?>';
    const REFRESH = 60000; // 60s
    const TAOLOGO = "https://s2.coinmarketcap.com/static/img/coins/64x64/22974.png";
    const CGAPI   = "https://api.coingecko.com/api/v3/simple/price?ids=bittensor&vs_currencies=usd";

    let taoUSD = null;

    // Pause on touch (mobile UX)
    bar.addEventListener('touchstart', ()=> ticker.style.animationPlayState='paused', {passive:true});
    bar.addEventListener('touchend',   ()=> ticker.style.animationPlayState='running', {passive:true});

    // ✅ Taostats logos w/ fallback SVG
  // ✅ Logo with fallback SVG - NOW USES CACHED URLs
function taoStatsLogo(sn, safeName, cachedLogoUrl){
    const label = (safeName || `SN${sn}`).toString().slice(0,3).toUpperCase();
    const fallbackSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'>"+
      "<circle cx='18' cy='18' r='18' fill='#e5e7eb'/>"+
      "<text x='50%' y='56%' font-family='Arial' font-size='12' text-anchor='middle' fill='#6b7280' font-weight='700'>"+
      label+"</text></svg>"
    )}`;

    // ✅ Use cached logo URL if available
    if (cachedLogoUrl && cachedLogoUrl.trim() !== '') {
        return `<img src="${cachedLogoUrl}" 
                     class="tao-logo"
                     alt="SN${sn} ${safeName}"
                     loading="lazy"
                     onerror="this.onerror=null;this.src='${fallbackSvg}'">`;
    } else {
        return `<img src="${fallbackSvg}" class="tao-logo" alt="SN${sn}">`;
    }
  }

    function money(v,dec){ return (v==null)?'—':('$'+Number(v).toFixed(dec)); }
    function pct(v){ if(v==null||isNaN(v)) return '—'; return Number(v).toFixed(2)+'%'; }

    function render(list){
      if(!Array.isArray(list)||!list.length){ ticker.textContent=''; return; }
      ticker.innerHTML = list.map(s=>{
        const up=(s.d1!=null&&Number(s.d1)>=0);
        const cls=up?'tao-up':'tao-down';
        const arrow=up?'▲':'▼';
        const netuid = s.netuid || s.sn;
        const url  = netuid ? `https://www.tao.app/networks/${netuid}` : '#';
        const usdPrice = (s.price && taoUSD) ? s.price * taoUSD : null;
        const safeName = String(s.subnet_name||s.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");

        let logoHtml = '';
        if (netuid == 1) {
          logoHtml = `<img src="${TAOLOGO}" class="tao-logo" alt="TAO" loading="lazy">`;
        } else if (netuid) {
			logoHtml = taoStatsLogo(netuid, safeName, s.logo_url);
         
        }

        return `<a href="${url}" target="_blank" rel="noopener" class="${cls}">
                  ${logoHtml} SN#${netuid} ${safeName||'N/A'} ${money(usdPrice,4)} ${arrow} ${pct(s.d1)}
                </a>`;
      }).join('');
    }

    async function load(){
      try{
        // Get TAO/USD price
        if(!taoUSD){
          const cg = await fetch(CGAPI);
          const cgData = await cg.json();
          taoUSD = cgData?.bittensor?.usd || null;
        }

        // ✅ UPDATED: Use WordPress cached proxy instead of motionwebbuilder
        const formData = new FormData();
        formData.append('action', 'tao_subnets_proxy');
        
        const res = await fetch(ajaxUrl, {
          method: 'POST',
          body: formData
        });
        
        const result = await res.json();
        
        if (result.success && result.data && result.data.data) {
          render(result.data.data);
        } else {
          ticker.textContent = '';
        }
      }catch(e){ 
        console.error('Error loading ticker:', e);
        ticker.textContent=''; 
      }
    }

    load();
    setInterval(load,REFRESH);
  })();
  </script>
  <?php
});



/* ===== BTC + TAO Live Widget (Responsive) ===== */
add_shortcode('btc_tao_live', function () {
  ob_start(); ?>
  <div id="btc-tao-live" class="crypto-box">
    <h3 class="box-head">REAL-TIME UPDATE</h3>
    <div class="crypto-list"></div>
  </div>

  <style>
    .crypto-box{font-family:Arial,Helvetica,sans-serif; width:100%; max-width:100%; margin:auto}
    .box-head{text-align:center;text-transform:uppercase;color:#333;font-size:16px;border-bottom:2px solid #f90;padding:6px 0;margin-bottom:8px}
    .crypto-list{display:flex;flex-direction:column;gap:8px}
    .crypto-item{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px;border-radius:8px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.08)}
    .crypto-name{display:flex;align-items:center;font-weight:600;color:#222;min-width:0}
    .crypto-logo{width:20px;height:20px;border-radius:50%;margin-right:6px;flex:0 0 auto}
    .crypto-price,.crypto-change{font-weight:700;flex:0 0 auto}
    .up{color:#0a9c39}.down{color:#d33939}
    @media (max-width:480px){
      .crypto-item{padding:8px}
      .crypto-logo{width:18px;height:18px}
      .crypto-item{font-size:13px}
      .crypto-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:55vw}
    }
  </style>

  <script>
  (async function(){
    const listBox = document.querySelector('#btc-tao-live .crypto-list');
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,bittensor&vs_currencies=usd&include_24hr_change=true';
    const logos = {
      bitcoin: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
      bittensor: 'https://taodaily.io/bittensor-tao-logo.png'
    };

    function fmtMoney(v){ return '$'+Number(v).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}); }
    function fmtPct(v){ return isNaN(v) ? '—' : v.toFixed(2)+'%'; }

    async function load() {
      try {
        const res = await fetch(url);
        const data = await res.json();
        const entries = [
          {id:'bitcoin', name:'Bitcoin', price:data.bitcoin.usd, change:data.bitcoin.usd_24h_change},
          {id:'bittensor', name:'TAO', price:data.bittensor.usd, change:data.bittensor.usd_24h_change}
        ];

        listBox.innerHTML = entries.map(c=>{
          const up = c.change >= 0;
          return `
          <div class="crypto-item">
            <span class="crypto-name">
              <img src="${logos[c.id]}" class="crypto-logo" alt="${c.name}">
              ${c.name}
            </span>
            <span class="crypto-price">${fmtMoney(c.price)}</span>
            <span class="crypto-change ${up ? 'up' : 'down'}">
              ${up ? '▲' : '▼'} ${fmtPct(c.change)}
            </span>
          </div>`;
        }).join('');
      } catch (e) {
        listBox.textContent = "";
      }
    }

    load();
    setInterval(load, 60000);
  })();
  </script>
  <?php
  return ob_get_clean();
});

add_action( 'init', function() {
    global $wp_post_types;
    if ( isset( $wp_post_types['question'] ) ) {
        $wp_post_types['question']->has_archive = true;
        $wp_post_types['question']->rewrite     = array( 'slug' => 'questions' );
    }
}, 20 );

function taodaily_allow_svg( $mimes ) {
  $mimes['svg'] = 'image/svg+xml';
  return $mimes;
}
add_filter( 'upload_mimes', 'taodaily_allow_svg' );

function custom_qa_widget_styles() {
    ?>
    <style>
        /* Fix sponsor banner widget for mobile */
        #media_image-3 {
            margin-left: auto !important;
            margin-right: auto !important;
            text-align: center;
        }

        #media_image-3 img {
            display: block;
            margin: 0 auto;
            height: auto;
            max-width: 100%;
        }

        @media (max-width: 480px) {
            #media_image-3 img {
                max-width: 250px;
            }
        }

        /* Ultra-Modern Q&A Widget */
        .widget_ap_questions_widget {
            background: #0a0a0a;
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 24px;
            padding: 0;
            margin-bottom: 30px;
            box-shadow: 
                0 20px 60px rgba(0, 0, 0, 0.5),
                inset 0 1px 0 rgba(255, 255, 255, 0.03);
            position: relative;
            overflow: hidden;
        }

        .widget_ap_questions_widget::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: 
                linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
            background-size: 20px 20px;
            opacity: 0.5;
            pointer-events: none;
            z-index: 0;
        }

        .widget_ap_questions_widget::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, 
                transparent 0%,
                #00d9ff 20%,
                #7b61ff 50%,
                #ff006b 80%,
                transparent 100%);
            background-size: 200% 100%;
            animation: shimmer 3s linear infinite;
            z-index: 2;
        }

        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }

        .widget_ap_questions_widget .ap-widget-header {
            position: relative;
            padding: 32px;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            z-index: 1;
        }

        .widget_ap_questions_widget .mh-widget-title {
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 12px;
            position: relative;
            z-index: 2;
        }

        .widget_ap_questions_widget .mh-widget-title .title-indicator {
            width: 8px;
            height: 8px;
            background: #00d9ff;
            border-radius: 50%;
            box-shadow: 0 0 20px #00d9ff;
            animation: pulse 2s ease-in-out infinite;
            flex-shrink: 0;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.2); }
        }

        .widget_ap_questions_widget .mh-widget-title .title-text {
            color: rgba(255, 255, 255, 0.7);
        }

        .widget_ap_questions_widget .mh-widget-title .title-count {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.3);
            font-weight: 500;
            letter-spacing: 1px;
            margin-left: auto;
        }

        .widget_ap_questions_widget .ap-widget-content {
            padding: 24px;
            position: relative;
            z-index: 1;
        }

        .widget_ap_questions_widget .ap-question-item {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 16px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            cursor: pointer;
        }

        .widget_ap_questions_widget .ap-question-item::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(
                600px circle at 50% 50%,
                rgba(0, 217, 255, 0.08),
                transparent 40%
            );
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
        }

        .widget_ap_questions_widget .ap-question-item:hover::before {
            opacity: 1;
        }

        .widget_ap_questions_widget .ap-question-item::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 16px;
            padding: 1px;
            background: linear-gradient(135deg, 
                rgba(0, 217, 255, 0.3),
                rgba(123, 97, 255, 0.3),
                rgba(255, 0, 107, 0.3)
            );
            -webkit-mask: 
                linear-gradient(#fff 0 0) content-box, 
                linear-gradient(#fff 0 0);
            mask: 
                linear-gradient(#fff 0 0) content-box, 
                linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
        }

        .widget_ap_questions_widget .ap-question-item:hover::after {
            opacity: 1;
        }

        .widget_ap_questions_widget .ap-question-item:hover {
            transform: translateY(-2px);
            background: rgba(255, 255, 255, 0.04);
            border-color: rgba(255, 255, 255, 0.1);
        }

        .widget_ap_questions_widget .ap-question-status {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 6px;
            height: 6px;
            background: #00ff88;
            border-radius: 50%;
            box-shadow: 0 0 10px #00ff88;
            animation: blink 2s ease-in-out infinite;
        }

        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }

        .widget_ap_questions_widget .ap-question-title {
            display: block;
            font-size: 16px;
            font-weight: 500;
            color: #ffffff;
            text-decoration: none;
            margin-bottom: 16px;
            line-height: 1.5;
            transition: all 0.3s ease;
            position: relative;
            padding-right: 20px;
        }

        .widget_ap_questions_widget .ap-question-title:hover {
            color: #00d9ff;
            transform: translateX(4px);
        }

        .widget_ap_questions_widget .ap-question-meta {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.04);
        }

        .widget_ap_questions_widget .ap-ans-count,
        .widget_ap_questions_widget .ap-vote-count {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.5);
            padding: 6px 12px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 8px;
            transition: all 0.3s ease;
        }

        .widget_ap_questions_widget .ap-ans-count::before {
            content: '';
            width: 16px;
            height: 16px;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2300d9ff" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>') center/contain no-repeat;
        }

        .widget_ap_questions_widget .ap-vote-count::before {
            content: '';
            width: 16px;
            height: 16px;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23ff006b" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>') center/contain no-repeat;
        }

        .widget_ap_questions_widget .ap-question-item:hover .ap-ans-count {
            background: rgba(0, 217, 255, 0.1);
            border-color: rgba(0, 217, 255, 0.3);
            color: #00d9ff;
        }

        .widget_ap_questions_widget .ap-question-item:hover .ap-vote-count {
            background: rgba(255, 0, 107, 0.1);
            border-color: rgba(255, 0, 107, 0.3);
            color: #ff006b;
        }

        .widget_ap_questions_widget .ap-ask-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            max-width: 225px;
            padding: 16px 24px;
            margin-top: 20px;
            background: linear-gradient(135deg, #00d9ff 0%, #7b61ff 100%);
            color: #000;
            border: none;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            text-align: center;
            text-decoration: none;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 
                0 0 0 0 rgba(0, 217, 255, 0.4),
                0 10px 30px rgba(0, 217, 255, 0.2);
            position: relative;
            overflow: hidden;
            cursor: pointer;
        }

        .widget_ap_questions_widget .ap-ask-btn::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, #7b61ff 0%, #ff006b 100%);
            opacity: 0;
            transition: opacity 0.3s;
        }

        .widget_ap_questions_widget .ap-ask-btn .btn-text {
            position: relative;
            z-index: 1;
        }

        .widget_ap_questions_widget .ap-ask-btn .btn-arrow {
            position: relative;
            z-index: 1;
            font-size: 18px;
            transition: transform 0.3s;
        }

        .widget_ap_questions_widget .ap-ask-btn:hover {
            transform: translateY(-2px);
            box-shadow: 
                0 0 0 4px rgba(0, 217, 255, 0.1),
                0 20px 40px rgba(0, 217, 255, 0.3);
        }

        .widget_ap_questions_widget .ap-ask-btn:hover::before {
            opacity: 1;
        }

        .widget_ap_questions_widget .ap-ask-btn:hover .btn-arrow {
            transform: translateX(4px);
        }

        .widget_ap_questions_widget .ap-no-questions {
            text-align: center;
            padding: 60px 20px;
            color: rgba(255, 255, 255, 0.3);
            font-size: 14px;
        }

        .widget_ap_questions_widget .ap-no-questions::before {
            content: '◯';
            display: block;
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.2;
            animation: rotate 10s linear infinite;
        }

        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
            .widget_ap_questions_widget .ap-widget-header {
                padding: 24px;
            }
            
            .widget_ap_questions_widget .ap-widget-content {
                padding: 20px;
            }
            
            .widget_ap_questions_widget .ap-question-item {
                padding: 20px;
            }
            
            .widget_ap_questions_widget .ap-question-meta {
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .widget_ap_questions_widget .mh-widget-title {
                font-size: 12px;
                letter-spacing: 2px;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .widget_ap_questions_widget *,
            .widget_ap_questions_widget *::before,
            .widget_ap_questions_widget *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    </style>
    <?php
}
add_action('wp_head', 'custom_qa_widget_styles');


add_filter('gettext', 'change_anspress_title_label', 20, 3);
function change_anspress_title_label($translated_text, $text, $domain) {
    if ($domain === 'anspress-question-answer' && $text === 'Title') {
        return 'Question';
    }
    return $translated_text;
}

/* ===== TAO/USD Calculator Shortcode (Comprehensive Calculator) ===== */
function tao_calculator_shortcode($atts = []) {
    $atts = shortcode_atts([
        'theme'   => 'light',
        'default' => '1'
    ], $atts, 'tao_calculator');

    $id = 'tao-calc-' . wp_generate_password(6, false, false);
    
    ob_start(); ?>
<div id="<?php echo esc_attr($id); ?>" class="tao-calculator-wrap" data-theme="<?php echo esc_attr($atts['theme']); ?>" data-default="<?php echo esc_attr($atts['default']); ?>"></div>

<style>
/* TAO Calculator Styles */
.tao-calculator-wrap {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    max-width: 1000px;
    margin: 2rem auto;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.tao-calc-header {
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    color: #fff;
    padding: 1.5rem;
}

.tao-calc-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
}

.tao-calc-price-info {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.875rem;
}

.tao-calc-price-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    background: rgba(255, 255, 255, 0.2);
    padding: 0.375rem 0.75rem;
    border-radius: 9999px;
    backdrop-filter: blur(10px);
}

.tao-calc-content {
    padding: 1.5rem;
}

.tao-calc-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.tao-calc-input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.tao-calc-input-group label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
}

.tao-calc-input-wrapper {
    position: relative;
    display: flex;
    gap: 0.5rem;
}

.tao-calc-input {
    flex: 1;
    padding: 0.75rem 1rem;
    font-size: 1.125rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    transition: all 0.2s;
}

.tao-calc-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.tao-calc-currency-badge {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-weight: 700;
    color: #6b7280;
    pointer-events: none;
}

.tao-calc-select {
    padding: 0.75rem 1rem;
    font-size: 1rem;
    font-weight: 600;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s;
}

.tao-calc-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.tao-calc-quick-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.tao-calc-quick-btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    background: #f3f4f6;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
}

.tao-calc-quick-btn:hover {
    background: #3b82f6;
    color: #fff;
    transform: translateY(-1px);
}

.tao-calc-section {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 0.75rem;
    border: 1px solid #e5e7eb;
}

.tao-calc-section h3 {
    font-size: 1rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: #111827;
}

.tao-calc-chart {
    height: 200px;
    margin: 1rem 0;
}

.tao-calc-historical {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.tao-calc-date-input {
    flex: 1;
    padding: 0.5rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    font-size: 0.875rem;
}

.tao-calc-btn {
    padding: 0.5rem 1.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
}

.tao-calc-btn-primary {
    background: #3b82f6;
    color: #fff;
}

.tao-calc-btn-primary:hover {
    background: #2563eb;
    transform: translateY(-1px);
}

.tao-calc-btn-success {
    background: #10b981;
    color: #fff;
}

.tao-calc-btn-success:hover {
    background: #059669;
}

.tao-calc-historical-result {
    padding: 1rem;
    background: #fff;
    border-radius: 0.5rem;
    margin-top: 1rem;
}

.tao-calc-historical-result p {
    margin: 0.5rem 0;
    color: #6b7280;
    font-size: 0.875rem;
}

.tao-calc-historical-price {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin: 0.5rem 0;
}

.tao-calc-alert-input {
    flex: 1;
    padding: 0.5rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    font-size: 0.875rem;
}

.tao-calc-alert-list {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.tao-calc-alert-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: #fff;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tao-calc-alert-price {
    font-weight: 700;
    color: #111827;
}

.tao-calc-alert-type {
    font-size: 0.75rem;
    color: #6b7280;
}

.tao-calc-btn-remove {
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    background: #ef4444;
    color: #fff;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
}

.tao-calc-insight {
    background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
    border: 2px solid #bfdbfe;
    padding: 1rem;
    border-radius: 0.75rem;
}

.tao-calc-insight h3 {
    color: #1e40af;
}

.tao-calc-insight-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    margin: 0.25rem 0;
    background: #fff;
    border-radius: 0.375rem;
}

.tao-calc-insight-label {
    color: #6b7280;
    font-size: 0.875rem;
}

.tao-calc-insight-value {
    font-weight: 700;
    font-size: 0.875rem;
}

.tao-calc-value-up { color: #10b981; }
.tao-calc-value-down { color: #ef4444; }

.tao-calc-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
}

.tao-calc-spinner {
    width: 3rem;
    height: 3rem;
    border: 4px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: tao-spin 1s linear infinite;
}

@keyframes tao-spin {
    to { transform: rotate(360deg); }
}

.tao-calc-empty {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
    font-size: 0.875rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .tao-calculator-wrap {
        margin: 1rem;
        border-radius: 12px;
    }
    
    .tao-calc-header {
        padding: 1rem;
    }
    
    .tao-calc-header h2 {
        font-size: 1.25rem;
    }
    
    .tao-calc-content {
        padding: 1rem;
    }
    
    .tao-calc-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .tao-calc-quick-btns {
        justify-content: center;
    }
    
    .tao-calc-historical {
        flex-direction: column;
    }
    
    .tao-calc-alert-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}

/* Print styles */
@media print {
    .tao-calc-header {
        background: #000 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
}
</style>

<script>
(function(){
    const root = document.getElementById('<?php echo esc_js($id); ?>');
    const TAO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=bittensor&vs_currencies=usd&include_24hr_change=true';
    
    const exchangeRates = {
        USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.50,
        CAD: 1.36, AUD: 1.52, CHF: 0.88
    };
    
    let state = {
        taoAmount: '1',
        fiatAmount: '0',
        currency: 'USD',
        currentPrice: null,
        priceChange: 0,
        historicalDate: '',
        historicalPrice: null,
        priceHistory: [],
        alerts: JSON.parse(localStorage.getItem('taoCalcAlerts') || '[]'),
        lastUpdate: null
    };
    
    function money(v, dec = 2) {
        return v == null ? '—' : '$' + Number(v).toLocaleString(undefined, {
            minimumFractionDigits: dec,
            maximumFractionDigits: dec
        });
    }
    
    function pct(v) {
        return (v == null || isNaN(v)) ? '—' : Number(v).toFixed(2) + '%';
    }
    
    async function fetchPrice() {
        try {
            const res = await fetch(TAO_API);
            const data = await res.json();
            state.currentPrice = data.bittensor.usd;
            state.priceChange = data.bittensor.usd_24h_change || 0;
            state.lastUpdate = new Date();
            
            // Generate mock price history
            if (state.priceHistory.length === 0) {
                const today = new Date();
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    state.priceHistory.push({
                        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        price: state.currentPrice - (Math.random() * 50) + 25
                    });
                }
            }
            
            render();
        } catch (e) {
            console.error('Error fetching TAO price:', e);
        }
    }
    
    function handleTaoChange(value) {
        state.taoAmount = value;
        if (state.currentPrice && value) {
            const usdValue = parseFloat(value) * state.currentPrice;
            const fiatValue = usdValue * exchangeRates[state.currency];
            state.fiatAmount = fiatValue.toFixed(2);
        } else {
            state.fiatAmount = '0';
        }
        render();
    }
    
    function handleFiatChange(value) {
        state.fiatAmount = value;
        if (state.currentPrice && value) {
            const usdValue = parseFloat(value) / exchangeRates[state.currency];
            const taoValue = usdValue / state.currentPrice;
            state.taoAmount = taoValue.toFixed(6);
        } else {
            state.taoAmount = '0';
        }
        render();
    }
    
    function handleCurrencyChange(currency) {
        state.currency = currency;
        if (state.taoAmount && state.currentPrice) {
            const usdValue = parseFloat(state.taoAmount) * state.currentPrice;
            const fiatValue = usdValue * exchangeRates[currency];
            state.fiatAmount = fiatValue.toFixed(2);
        }
        render();
    }
    
    function handleHistoricalLookup() {
        if (state.historicalDate) {
            // Mock historical price (replace with actual API)
            state.historicalPrice = 250.00 + (Math.random() * 100);
            render();
        }
    }
    
    function addAlert(price) {
        if (price && parseFloat(price) > 0) {
            const alert = {
                id: Date.now(),
                price: parseFloat(price),
                type: parseFloat(price) > state.currentPrice ? 'above' : 'below',
                created: new Date().toLocaleString()
            };
            state.alerts.push(alert);
            localStorage.setItem('taoCalcAlerts', JSON.stringify(state.alerts));
            render();
        }
    }
    
    function removeAlert(id) {
        state.alerts = state.alerts.filter(a => a.id !== id);
        localStorage.setItem('taoCalcAlerts', JSON.stringify(state.alerts));
        render();
    }
    
    function checkAlerts() {
        if (!state.currentPrice || state.alerts.length === 0) return;
        
        const triggeredAlerts = [];
        
        state.alerts.forEach(alert => {
            if (
                (alert.type === 'above' && state.currentPrice >= alert.price) ||
                (alert.type === 'below' && state.currentPrice <= alert.price)
            ) {
                triggeredAlerts.push(alert);
                
                // Send OneSignal notification
                const message = `TAO has reached $${state.currentPrice.toFixed(2)}! Your alert for $${alert.price.toFixed(2)} has been triggered.`;
                
                fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'tao_send_onesignal_alert',
                        message: message,
                        price: state.currentPrice.toFixed(2),
                        target: alert.price.toFixed(2)
                    })
                });
            }
        });
        
        // Remove triggered alerts
        if (triggeredAlerts.length > 0) {
            state.alerts = state.alerts.filter(a => 
                !triggeredAlerts.some(ta => ta.id === a.id)
            );
            localStorage.setItem('taoCalcAlerts', JSON.stringify(state.alerts));
            render();
        }
    }
    
    function render() {
        if (!state.currentPrice) {
            root.innerHTML = '<div class="tao-calc-loading"><div class="tao-calc-spinner"></div></div>';
            return;
        }
        
        const priceUp = state.priceChange >= 0;
        const investCurrent = state.taoAmount && state.currentPrice ? 
            parseFloat(state.taoAmount) * state.currentPrice * exchangeRates[state.currency] : 0;
        
        root.innerHTML = `
            <div class="tao-calc-header">
                <h2>TAO Calculator</h2>
                <div class="tao-calc-price-info">
                    <span class="tao-calc-price-badge">
                        Current: ${money(state.currentPrice, 2)}
                    </span>
                    <span class="tao-calc-price-badge ${priceUp ? 'tao-calc-value-up' : 'tao-calc-value-down'}">
                        ${priceUp ? '▲' : '▼'} ${pct(Math.abs(state.priceChange))}
                    </span>
                    <span class="tao-calc-price-badge">
                        Updated: ${state.lastUpdate.toLocaleTimeString()}
                    </span>
                </div>
            </div>
            
            <div class="tao-calc-content">
                <div class="tao-calc-grid">
                    <div class="tao-calc-input-group">
                        <label>TAO Amount</label>
                        <div class="tao-calc-input-wrapper">
                            <input type="number" class="tao-calc-input" id="tao-input"
                                   value="${state.taoAmount}" step="0.000001" placeholder="0.00">
                            <span class="tao-calc-currency-badge">TAO</span>
                        </div>
                    </div>
                    
                    <div class="tao-calc-input-group">
                        <label>Fiat Amount</label>
                        <div class="tao-calc-input-wrapper">
                            <input type="number" class="tao-calc-input" id="fiat-input"
                                   value="${state.fiatAmount}" step="0.01" placeholder="0.00">
                            <select class="tao-calc-select" id="currency-select">
                                ${Object.keys(exchangeRates).map(c => 
                                    `<option value="${c}" ${c === state.currency ? 'selected' : ''}>${c}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="tao-calc-quick-btns">
                    ${[1, 10, 50, 100, 500, 1000].map(amt => 
                        `<button class="tao-calc-quick-btn" data-amount="${amt}">${amt} TAO</button>`
                    ).join('')}
                </div>
                
                <div class="tao-calc-section">
                    <h3>📅 Historical Price Lookup</h3>
                    <div class="tao-calc-historical">
                        <input type="date" class="tao-calc-date-input" id="hist-date"
                               value="${state.historicalDate}" max="${new Date().toISOString().split('T')[0]}">
                        <button class="tao-calc-btn tao-calc-btn-primary" id="hist-btn">Lookup</button>
                    </div>
                    ${state.historicalPrice && state.historicalDate ? `
                        <div class="tao-calc-historical-result">
                            <p>${new Date(state.historicalDate).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })}</p>
                            <div class="tao-calc-historical-price">${money(state.historicalPrice, 2)}</div>
                            ${state.taoAmount ? `<p>${state.taoAmount} TAO = ${money(parseFloat(state.taoAmount) * state.historicalPrice, 2)}</p>` : ''}
                        </div>
                    ` : ''}
                </div>
                
                <div class="tao-calc-section">
                    <h3>🔔 Price Alerts</h3>
                    <div class="tao-calc-historical">
                        <input type="number" class="tao-calc-alert-input" id="alert-input"
                               placeholder="Enter target price..." step="0.01">
                        <button class="tao-calc-btn tao-calc-btn-success" id="alert-btn">Add Alert</button>
                    </div>
                    
                    ${state.alerts.length > 0 ? `
                        <div class="tao-calc-alert-list">
                            ${state.alerts.map(alert => `
                                <div class="tao-calc-alert-item">
                                    <div>
                                        <div class="tao-calc-alert-price">${money(alert.price, 2)}</div>
                                        <div class="tao-calc-alert-type">Alert when price goes ${alert.type} • ${alert.created}</div>
                                    </div>
                                    <button class="tao-calc-btn-remove" data-id="${alert.id}">Remove</button>
                                </div>
                            `).join('')}
                        </div>
                    ` : `<div class="tao-calc-empty">No active alerts. Add a target price to get notified.</div>`}
                </div>
                
                ${investCurrent > 0 ? `
                    <div class="tao-calc-insight">
                        <h3>💡 Quick Investment Insight</h3>
                        <div class="tao-calc-insight-item">
                            <span class="tao-calc-insight-label">Current Value:</span>
                            <span class="tao-calc-insight-value">${state.currency} ${money(investCurrent, 2)}</span>
                        </div>
                        <div class="tao-calc-insight-item">
                            <span class="tao-calc-insight-label">If +10%:</span>
                            <span class="tao-calc-insight-value tao-calc-value-up">${state.currency} ${money(investCurrent * 1.1, 2)}</span>
                        </div>
                        <div class="tao-calc-insight-item">
                            <span class="tao-calc-insight-label">If -10%:</span>
                            <span class="tao-calc-insight-value tao-calc-value-down">${state.currency} ${money(investCurrent * 0.9, 2)}</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Attach event listeners
        document.getElementById('tao-input').addEventListener('input', (e) => handleTaoChange(e.target.value));
        document.getElementById('fiat-input').addEventListener('input', (e) => handleFiatChange(e.target.value));
        document.getElementById('currency-select').addEventListener('change', (e) => handleCurrencyChange(e.target.value));
        document.getElementById('hist-date').addEventListener('change', (e) => { state.historicalDate = e.target.value; });
        document.getElementById('hist-btn').addEventListener('click', handleHistoricalLookup);
        document.getElementById('alert-btn').addEventListener('click', () => {
            const input = document.getElementById('alert-input');
            addAlert(input.value);
            input.value = '';
        });
        
        document.querySelectorAll('.tao-calc-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => handleTaoChange(btn.dataset.amount));
        });
        
        document.querySelectorAll('.tao-calc-btn-remove').forEach(btn => {
            btn.addEventListener('click', () => removeAlert(parseInt(btn.dataset.id)));
        });
    }
    
    // Initialize
    fetchPrice();
    setInterval(() => {
        fetchPrice();
        checkAlerts();
    }, 30000); // Update and check alerts every 30 seconds
})();
</script>
<?php
    return ob_get_clean();
}
add_shortcode('tao_calculator', 'tao_calculator_shortcode');

// AJAX handler for sending OneSignal notifications
add_action('wp_ajax_tao_send_onesignal_alert', 'tao_send_onesignal_alert');
add_action('wp_ajax_nopriv_tao_send_onesignal_alert', 'tao_send_onesignal_alert');

function tao_send_onesignal_alert() {
    $message = sanitize_text_field($_POST['message']);
    $price = sanitize_text_field($_POST['price']);
    $target = sanitize_text_field($_POST['target']);
    
    // Send OneSignal notification using WordPress OneSignal plugin
    if (function_exists('onesignal_send_notification')) {
        onesignal_send_notification([
            'contents' => ['en' => $message],
            'headings' => ['en' => '🔔 TAO Price Alert!'],
            'url' => home_url('/tao-calculator'),
            'included_segments' => ['Subscribed Users']
        ]);
    }
    
    wp_send_json_success(['message' => 'Notification sent']);
}

/**
 * Plugin Name: TAO Whale Tracker (Complete)
 * Description: TAO whale tracker with WordPress proxy - Complete Working Version
 * Version: 5.0 - Complete
 * Author: TAO Daily
 */

if (!defined('ABSPATH')) exit;

// AJAX endpoint for whale data (acts as proxy)
add_action('wp_ajax_tao_whale_proxy', 'tao_whale_proxy');
add_action('wp_ajax_nopriv_tao_whale_proxy', 'tao_whale_proxy');

function tao_whale_proxy() {
    $limit = isset($_POST['limit']) ? min((int)$_POST['limit'], 500) : 100;
    
    // Check cache first (24 hour cache)
    $cache_key = 'tao_whales_' . $limit;
    $cached = get_transient($cache_key);
    
    if ($cached !== false) {
        wp_send_json_success($cached);
        return;
    }
    
    // Taostats API Key
    $api_key = 'tao-29151f33-2d7e-4e3e-a2ae-8aad53da4aca:d1591ddc';
    
    $ch = curl_init();
    
    curl_setopt_array($ch, [
        CURLOPT_URL => "https://api.taostats.io/api/account/latest/v1?order=balance_total_desc&limit={$limit}&page=1",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => [
            'Authorization: ' . $api_key,
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept: application/json',
            'Referer: https://taostats.io/'
        ]
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        wp_send_json_error(['message' => 'cURL error', 'error' => $error]);
        return;
    }
    
    if ($httpCode !== 200) {
        wp_send_json_error(['message' => "HTTP {$httpCode}", 'response' => substr($response, 0, 500)]);
        return;
    }
    
    $data = json_decode($response, true);
    
    if (!$data || !isset($data['data'])) {
        wp_send_json_error(['message' => 'Invalid response']);
        return;
    }
    
    // Cache for 24 hours (86400 seconds)
    set_transient($cache_key, $data, DAY_IN_SECONDS);
    
    wp_send_json_success($data);
}
add_action('wp_ajax_tao_price_proxy', 'tao_price_proxy');
add_action('wp_ajax_nopriv_tao_price_proxy', 'tao_price_proxy');

function tao_price_proxy() {
    // Check cache first (24 hour cache)
    $cached = get_transient('tao_price');
    
    if ($cached !== false) {
        wp_send_json_success(['price' => $cached]);
        return;
    }
    
    $api_key = 'tao-29151f33-2d7e-4e3e-a2ae-8aad53da4aca:d1591ddc';
    
    $ch = curl_init();
    
    curl_setopt_array($ch, [
        CURLOPT_URL => 'https://api.taostats.io/api/price/tao/v1',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => [
            'Authorization: ' . $api_key,
            'Accept: application/json'
        ]
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if ($data && isset($data['data'][0]['price_usd'])) {
            $price = floatval($data['data'][0]['price_usd']);
            
            // Cache for 24 hours (86400 seconds)
            set_transient('tao_price', $price, DAY_IN_SECONDS);
            
            wp_send_json_success(['price' => $price]);
            return;
        }
    }
    
    wp_send_json_success(['price' => 297.10]);
}

// ===== SUBNETS PROXY - 24 HOUR CACHE =====
// ===== SUBNETS PROXY - 24 HOUR CACHE (USING TAO.APP API) =====
add_action('wp_ajax_tao_subnets_proxy', 'tao_subnets_proxy_cached');
add_action('wp_ajax_nopriv_tao_subnets_proxy', 'tao_subnets_proxy_cached');

function tao_subnets_proxy_cached() {
    error_log("========================================");
    error_log("TAO: Proxy called");
    
    // Check cache
    $cached = get_transient('tao_subnets');
    if ($cached !== false) {
        error_log("TAO: ✅ Cache hit");
        wp_send_json_success($cached);
        return;
    }
    
    error_log("TAO: Cache miss - fetching data");
    
    // ===== 1. GET SUBNET INFO FROM TAOSTATS =====
    $taostatsResponse = wp_remote_get('https://api.taostats.io/api/subnet/identity/v1', [
        'headers' => [
            'Authorization' => 'tao-29151f33-2d7e-4e3e-a2ae-8aad53da4aca:d1591ddc',
            'Accept' => 'application/json'
        ],
        'timeout' => 30
    ]);
    
    if (is_wp_error($taostatsResponse) || wp_remote_retrieve_response_code($taostatsResponse) !== 200) {
        error_log("TAO: ❌ Taostats failed");
        wp_send_json_success(['data' => []]);
        return;
    }
    
    $taostatsData = json_decode(wp_remote_retrieve_body($taostatsResponse), true);
    if (!isset($taostatsData['data'])) {
        error_log("TAO: ❌ Invalid Taostats response");
        wp_send_json_success(['data' => []]);
        return;
    }
    
    // Build logo map
    $logoMap = [];
    foreach ($taostatsData['data'] as $subnet) {
        $netuid = $subnet['netuid'] ?? null;
        $logoUrl = $subnet['logo_url'] ?? null;
        
        if ($netuid !== null && $logoUrl && trim($logoUrl) !== '') {
            $logoMap[$netuid] = $logoUrl;
        }
    }
    
    error_log("TAO: ✅ Got " . count($logoMap) . " logos from Taostats");
    
    // ===== 2. GET PRICE DATA FROM TAO.APP =====
    $taoappResponse = wp_remote_get('https://api.tao.app/api/beta/analytics/subnets/info', [
        'headers' => ['X-API-KEY' => 'bf5d67bc220f905cba7893bebdeb73b91b414a705f240b82c9d3299d23325640'],
        'timeout' => 30
    ]);
    
    if (is_wp_error($taoappResponse) || wp_remote_retrieve_response_code($taoappResponse) !== 200) {
        error_log("TAO: ❌ TAO.APP failed");
        wp_send_json_success(['data' => []]);
        return;
    }
    
    $taoappData = json_decode(wp_remote_retrieve_body($taoappResponse), true);
    if (!$taoappData) {
        error_log("TAO: ❌ Invalid TAO.APP response");
        wp_send_json_success(['data' => []]);
        return;
    }
    
    error_log("TAO: ✅ Got " . count($taoappData) . " subnets from TAO.APP");
    
    // ===== 3. MERGE DATA =====
    $rows = [];
    foreach ($taoappData as $subnet) {
        $netuid = $subnet['netuid'] ?? null;
        $name = $subnet['subnet_name'] ?? 'Unknown';
        $price = $subnet['price'] ?? null;
        
        $rows[] = [
            'netuid'      => $netuid,
            'sn'          => $netuid,
            'name'        => $name,
            'subnet_name' => $name,
            'price'       => $price,
            'marketcap'   => $subnet['marketcap'] ?? 0,
            'logo_url'    => $logoMap[$netuid] ?? null
        ];
    }
    
    error_log("TAO: ✅ Built " . count($rows) . " rows with logos and prices");
    
    $result = ['data' => $rows];
    set_transient('tao_subnets', $result, DAY_IN_SECONDS);
    
    error_log("TAO: ✅ Cached successfully");
    error_log("========================================");
    
    wp_send_json_success($result);
}
// ===== SCHEDULED CACHE REFRESH (Daily at Midnight) =====
// This ensures fresh data every day at midnight
add_action('init', 'tao_schedule_daily_cache_refresh');

function tao_schedule_daily_cache_refresh() {
    if (!wp_next_scheduled('tao_daily_cache_refresh')) {
        wp_schedule_event(strtotime('tomorrow midnight'), 'daily', 'tao_daily_cache_refresh');
    }
}

add_action('tao_daily_cache_refresh', 'tao_clear_all_caches');

function tao_clear_all_caches() {
    // Clear all TAO caches at midnight
    delete_transient('tao_whales_100');
    delete_transient('tao_whales_50');
    delete_transient('tao_whales_500');
    delete_transient('tao_price');
    delete_transient('tao_subnets');
    
    error_log('TAO Daily Cache Cleared at: ' . current_time('mysql'));
}



function tao_whale_tracker_complete($atts) {
    $atts = shortcode_atts([
        'limit' => 100,
        'refresh' => 60
    ], $atts);
    
    $id = 'tao-whales-' . wp_generate_password(6, false, false);
    $ajax_url = admin_url('admin-ajax.php');
    
    ob_start();
    ?>
    <div id="<?php echo esc_attr($id); ?>" class="tao-whales-container"></div>
    
    <style>
/* TAO Whale Tracker Styles */
.tao-whales-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    max-width: 1400px;
    margin: 2rem auto;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.tao-whales-header {
    background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
    color: #fff;
    padding: 2rem;
}

.tao-whales-header h2 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
}

.tao-whales-header .subtitle {
    font-size: 1rem;
    opacity: 0.9;
}

.tao-whales-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    padding: 1.5rem 2rem;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
}

.tao-whales-stat {
    text-align: center;
}

.tao-whales-stat-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #6b7280;
    font-weight: 600;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
}

.tao-whales-stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
}

.tao-whales-filters {
    display: flex;
    gap: 1rem;
    padding: 1.5rem 2rem;
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
    flex-wrap: wrap;
    align-items: center;
}

.tao-whales-search {
    flex: 1;
    min-width: 250px;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
}

.tao-whales-search:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.tao-whales-filter-btn {
    padding: 0.75rem 1.5rem;
    background: #f3f4f6;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.tao-whales-filter-btn:hover,
.tao-whales-filter-btn.active {
    background: #3b82f6;
    color: #fff;
    border-color: #3b82f6;
}

.tao-whales-content {
    padding: 2rem;
}

.tao-whales-table-wrap {
    overflow-x: auto;
}

.tao-whales-table {
    width: 100%;
    border-collapse: collapse;
}

.tao-whales-table thead {
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
}

.tao-whales-table th {
    padding: 1rem;
    text-align: left;
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 700;
    color: #6b7280;
    letter-spacing: 0.5px;
    cursor: pointer;
    user-select: none;
}

.tao-whales-table th:hover {
    background: #f3f4f6;
}

.tao-whales-table th.sortable::after {
    content: ' ⇅';
    opacity: 0.3;
}

.tao-whales-table th.sort-asc::after {
    content: ' ▲';
    opacity: 1;
}

.tao-whales-table th.sort-desc::after {
    content: ' ▼';
    opacity: 1;
}

.tao-whales-table tbody tr {
    border-bottom: 1px solid #e5e7eb;
    transition: background 0.2s;
}

.tao-whales-table tbody tr:hover {
    background: #f9fafb;
}

.tao-whales-table td {
    padding: 1rem;
    font-size: 0.875rem;
}

.whale-rank {
    font-weight: 700;
    color: #6b7280;
    font-size: 1rem;
}

.whale-rank.top-3 {
    color: #f59e0b;
    font-size: 1.25rem;
}

.whale-address {
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    color: #3b82f6;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.whale-address-text {
    cursor: pointer;
    color: #3b82f6;
    text-decoration: none;
    transition: all 0.2s;
}

.whale-address-text:hover {
    text-decoration: underline;
    color: #2563eb;
}

.copy-btn {
    padding: 0.25rem 0.5rem;
    background: #e5e7eb;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
    transition: all 0.2s;
}

.copy-btn:hover {
    background: #3b82f6;
    color: #fff;
}

.whale-balance {
    font-weight: 700;
    color: #111827;
}

.whale-usd {
    color: #10b981;
    font-weight: 600;
}

.whale-percent {
    font-weight: 600;
    color: #7c3aed;
}

.tao-whales-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
}

.tao-whales-spinner {
    width: 3rem;
    height: 3rem;
    border: 4px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: tao-whale-spin 1s linear infinite;
}

@keyframes tao-whale-spin {
    to { transform: rotate(360deg); }
}

.tao-whales-empty {
    text-align: center;
    padding: 4rem 2rem;
    color: #6b7280;
}

.tao-whales-footer {
    padding: 1.5rem 2rem;
    background: #f9fafb;
    border-top: 1px solid #e5e7eb;
    text-align: center;
    font-size: 0.875rem;
    color: #6b7280;
}

.tao-whales-pagination {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 2rem;
}

.page-btn {
    padding: 0.5rem 1rem;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
    background: #3b82f6;
    color: #fff;
    border-color: #3b82f6;
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-btn.active {
    background: #3b82f6;
    color: #fff;
    border-color: #3b82f6;
}

@media (max-width: 768px) {
    .tao-whales-container { margin: 1rem; border-radius: 12px; }
    .tao-whales-header { padding: 1.5rem; }
    .tao-whales-header h2 { font-size: 1.5rem; }
    .tao-whales-stats { grid-template-columns: repeat(2, 1fr); padding: 1rem; }
    .tao-whales-filters { padding: 1rem; }
    .tao-whales-content { padding: 1rem; }
    .tao-whales-table { font-size: 0.75rem; }
    .tao-whales-table th, .tao-whales-table td { padding: 0.75rem 0.5rem; }
    .whale-address { flex-direction: column; align-items: flex-start; }
}
</style>
    
    <script>
    (function() {
        const containerId = '<?php echo esc_js($id); ?>';
        const ajaxUrl = '<?php echo esc_js($ajax_url); ?>';
        const limit = <?php echo (int)$atts['limit']; ?>;
        const refreshInterval = <?php echo (int)$atts['refresh'] * 1000; ?>;
        const TOTAL_SUPPLY = 21000000;
        
        let state = {
            whales: [],
            allWhales: [],
            taoPrice: 0,
            currentPage: 1,
            itemsPerPage: 20,
            sortBy: 'rank',
            sortDir: 'asc',
            searchQuery: '',
            filterType: 'all',
            lastUpdate: null,
            isInitialLoad: true
        };
        
        function formatNumber(num, decimals = 2) {
            return Number(num).toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
        }
        
        function shortenAddress(addr) {
            if (!addr || addr.length < 12) return addr;
            return addr.slice(0, 8) + '...' + addr.slice(-4);
        }
        
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                const toast = document.createElement('div');
                toast.textContent = 'Address copied!';
                toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:#fff;padding:1rem 1.5rem;border-radius:8px;z-index:9999;';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2000);
            });
        }
        
        async function fetchWhaleData() {
            try {
                console.log('🐋 Fetching whale data via WordPress proxy...');
                
                const formData = new FormData();
                formData.append('action', 'tao_whale_proxy');
                formData.append('limit', limit);
                
                const response = await fetch(ajaxUrl, {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                
                const result = await response.json();
                
                if (!result.success) {
                    throw new Error(result.data?.message || 'API error');
                }
                
                const data = result.data;
                
                if (!data || !data.data || !Array.isArray(data.data)) {
                    throw new Error('Invalid response structure');
                }
                
                state.allWhales = data.data.map((acc, index) => {
                    const balanceTao = parseFloat(acc.balance_total || 0) / 1e9;
                    return {
                        rank: acc.rank || (index + 1),
                        address: acc.address?.ss58 || 'Unknown',
                        balance: balanceTao,
                        percent: (balanceTao / TOTAL_SUPPLY) * 100
                    };
                });
                
                state.lastUpdate = new Date();
                console.log(`✅ Loaded ${state.allWhales.length} whales via proxy`);
                return true;
                
            } catch (error) {
                console.error('❌ Error fetching whale data:', error);
                state.allWhales = [];
                return false;
            }
        }
        function renderSubnets(list) {
    console.log('Rendering', list.length, 'subnets');
    
    const container = document.getElementById('tao-subnets-container');
    if (!container) {
        console.error('Container not found');
        return;
    }
    
    if (list.length === 0) {
        container.innerHTML = '<div class="tao-error">No subnet data available</div>';
        return;
    }
    
    container.innerHTML = '';
    
    list.forEach(s => {
        const netuid = s.netuid || s.sn;
        const safeName = s.name || s.subnet_name || `Subnet ${netuid}`;
        
        const item = document.createElement('div');
        item.className = 'tao-subnet-item';
        
        // ✅ Mouse tracking for glow effect
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            item.style.setProperty('--mouse-x', x + '%');
            item.style.setProperty('--mouse-y', y + '%');
        });
        
        item.innerHTML = `
            <div class="tao-logo-wrapper">
                ${taoStatsLogo(netuid, safeName, s.logo_url)}
            </div>
            <div class="tao-subnet-info">
                <span class="tao-subnet-id">SN#${netuid}</span>
                <span class="tao-subnet-name">${safeName}</span>
            </div>
        `;
        
        container.appendChild(item);
    });
}
        async function fetchTaoPrice() {
            try {
                const formData = new FormData();
                formData.append('action', 'tao_price_proxy');
                
                const response = await fetch(ajaxUrl, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success && result.data.price) {
                    state.taoPrice = result.data.price;
                    console.log(`✅ TAO Price: $${state.taoPrice.toFixed(2)}`);
                } else {
                    state.taoPrice = 297.10;
                }
                
            } catch (error) {
                state.taoPrice = 297.10;
                console.log('⚠️ Using fallback price: $297.10');
            }
        }
        
        function sortWhales(whales) {
            return [...whales].sort((a, b) => {
                let aVal = a[state.sortBy];
                let bVal = b[state.sortBy];
                
                if (state.sortDir === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }
        
        function filterWhales(whales) {
            let filtered = whales;
            
            if (state.searchQuery) {
                const query = state.searchQuery.toLowerCase();
                filtered = filtered.filter(w => 
                    w.address.toLowerCase().includes(query) ||
                    w.rank.toString().includes(query)
                );
            }
            
            if (state.filterType === 'whales') {
                filtered = filtered.filter(w => w.percent > 1);
            } else if (state.filterType === 'dolphins') {
                filtered = filtered.filter(w => w.percent > 0.1 && w.percent <= 1);
            } else if (state.filterType === 'shrimp') {
                filtered = filtered.filter(w => w.percent <= 0.1);
            }
            
            return filtered;
        }
        
        function paginateWhales(whales) {
            const start = (state.currentPage - 1) * state.itemsPerPage;
            const end = start + state.itemsPerPage;
            return whales.slice(start, end);
        }
        
        function handleSort(field) {
            if (state.sortBy === field) {
                state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                state.sortBy = field;
                state.sortDir = 'asc';
            }
            render();
        }
        
        function render() {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            // Only show loading spinner on initial load
            if (state.allWhales.length === 0 && state.isInitialLoad) {
                container.innerHTML = `
                    <div class="tao-whales-header">
                        <h2>🐋 TAO Whale Tracker</h2>
                        <div class="subtitle">Real-time top ${limit} TAO wallet leaderboard</div>
                    </div>
                    <div class="tao-whales-loading"><div class="tao-whales-spinner"></div></div>
                `;
                return;
            }
            
            // If no data after initial load, show error
            if (state.allWhales.length === 0) {
                container.innerHTML = `
                    <div class="tao-whales-header">
                        <h2>🐋 TAO Whale Tracker</h2>
                        <div class="subtitle">Real-time top ${limit} TAO wallet leaderboard</div>
                    </div>
                    <div class="tao-whales-empty">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                        <h3 style="margin-bottom: 0.5rem;">Unable to load whale data</h3>
                        <p>Please check your connection and try again.</p>
                    </div>
                `;
                return;
            }
            
            const filtered = filterWhales(state.allWhales);
            const sorted = sortWhales(filtered);
            const paginated = paginateWhales(sorted);
            const totalPages = Math.ceil(filtered.length / state.itemsPerPage);
            
            const totalTao = state.allWhales.reduce((sum, w) => sum + w.balance, 0);
            const totalPercent = (totalTao / TOTAL_SUPPLY) * 100;
            const totalUsd = totalTao * state.taoPrice;
            
            container.innerHTML = `
                <div class="tao-whales-header">
                    <h2>🐋 TAO Whale Tracker</h2>
                    <div class="subtitle">Real-time top ${state.allWhales.length} TAO wallet leaderboard</div>
                </div>
                
                <div class="tao-whales-stats">
                    <div class="tao-whales-stat">
                        <div class="tao-whales-stat-label">Wallets Tracked</div>
                        <div class="tao-whales-stat-value">${formatNumber(state.allWhales.length, 0)}</div>
                    </div>
                    <div class="tao-whales-stat">
                        <div class="tao-whales-stat-label">Total TAO</div>
                        <div class="tao-whales-stat-value">${formatNumber(totalTao, 0)}</div>
                    </div>
                    <div class="tao-whales-stat">
                        <div class="tao-whales-stat-label">% of Supply</div>
                        <div class="tao-whales-stat-value">${formatNumber(totalPercent, 2)}%</div>
                    </div>
                    <div class="tao-whales-stat">
                        <div class="tao-whales-stat-label">Total Value</div>
                        <div class="tao-whales-stat-value">$${formatNumber(totalUsd, 0)}</div>
                    </div>
                </div>
                
                <div class="tao-whales-filters">
                    <input type="text" 
                           class="tao-whales-search" 
                           placeholder="Search by address or rank..."
                           id="whale-search"
                           value="${state.searchQuery}">
                    <button class="tao-whales-filter-btn ${state.filterType === 'all' ? 'active' : ''}" data-filter="all">
                        All
                    </button>
                    <button class="tao-whales-filter-btn ${state.filterType === 'whales' ? 'active' : ''}" data-filter="whales">
                        🐋 Whales (>1%)
                    </button>
                    <button class="tao-whales-filter-btn ${state.filterType === 'dolphins' ? 'active' : ''}" data-filter="dolphins">
                        🐬 Dolphins (0.1-1%)
                    </button>
                    <button class="tao-whales-filter-btn ${state.filterType === 'shrimp' ? 'active' : ''}" data-filter="shrimp">
                        🦐 Shrimp (<0.1%)
                    </button>
                </div>
                
                <div class="tao-whales-content">
                    <div class="tao-whales-table-wrap">
                        <table class="tao-whales-table">
                            <thead>
                                <tr>
                                    <th class="sortable ${state.sortBy === 'rank' ? 'sort-' + state.sortDir : ''}" 
                                        data-sort="rank">Rank</th>
                                    <th>Address</th>
                                    <th class="sortable ${state.sortBy === 'balance' ? 'sort-' + state.sortDir : ''}" 
                                        data-sort="balance">Balance (TAO)</th>
                                    <th class="sortable ${state.sortBy === 'percent' ? 'sort-' + state.sortDir : ''}" 
                                        data-sort="percent">% of Supply</th>
                                    <th>USD Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${paginated.map(whale => {
                                    const medal = whale.rank === 1 ? '🥇' : whale.rank === 2 ? '🥈' : whale.rank === 3 ? '🥉' : '#' + whale.rank;
                                    const usdValue = whale.balance * state.taoPrice;
                                    
                                  return `
    <tr>
        <td>
            <span class="whale-rank ${whale.rank <= 3 ? 'top-3' : ''}">
                ${medal}
            </span>
        </td>
        <td>
            <div class="whale-address">
                <a href="https://taostats.io/account/${whale.address}" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   class="whale-address-text" 
                   title="${whale.address}">
                    ${shortenAddress(whale.address)}
                </a>
                <button class="copy-btn" data-address="${whale.address}">Copy</button>
            </div>
        </td>
                                            <td class="whale-balance">${formatNumber(whale.balance, 2)}</td>
                                            <td class="whale-percent">${formatNumber(whale.percent, 3)}%</td>
                                            <td class="whale-usd">$${formatNumber(usdValue, 2)}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    ${totalPages > 1 ? `
                        <div class="tao-whales-pagination">
                            <button class="page-btn" ${state.currentPage === 1 ? 'disabled' : ''} data-page="prev">
                                ← Previous
                            </button>
                            ${Array.from({length: Math.min(totalPages, 5)}, (_, i) => {
                                const page = i + 1;
                                return `
                                    <button class="page-btn ${state.currentPage === page ? 'active' : ''}" data-page="${page}">
                                        ${page}
                                    </button>
                                `;
                            }).join('')}
                            ${totalPages > 5 ? `<span>...</span>` : ''}
                            <button class="page-btn" ${state.currentPage === totalPages ? 'disabled' : ''} data-page="next">
                                Next →
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <div class="tao-whales-footer">
                    Last updated: ${state.lastUpdate ? state.lastUpdate.toLocaleTimeString() : 'Never'} | 
                    Updates every ${refreshInterval / 1000} seconds
                    
                </div>
            `;
            
            // Attach event listeners
            const searchInput = document.getElementById('whale-search');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    state.searchQuery = e.target.value;
                    state.currentPage = 1;
                    render();
                });
            }
            
            document.querySelectorAll('.tao-whales-filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    state.filterType = e.target.dataset.filter;
                    state.currentPage = 1;
                    render();
                });
            });
            
            document.querySelectorAll('th[data-sort]').forEach(th => {
                th.addEventListener('click', (e) => {
                    handleSort(e.target.dataset.sort);
                });
            });
            
            document.querySelectorAll('.copy-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    copyToClipboard(e.target.dataset.address);
                });
            });
            
            document.querySelectorAll('.page-btn[data-page]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const page = e.target.dataset.page;
                    if (page === 'prev') {
                        state.currentPage = Math.max(1, state.currentPage - 1);
                    } else if (page === 'next') {
                        state.currentPage = Math.min(totalPages, state.currentPage + 1);
                    } else {
                        state.currentPage = parseInt(page);
                    }
                    render();
                });
            });
        }
        
        async function init() {
            render(); // Show loading spinner only on first load
            
            await Promise.all([
                fetchWhaleData(),
                fetchTaoPrice()
            ]);
            
            state.isInitialLoad = false; // Mark initial load complete
            render(); // Show data
            
            // Auto-refresh in background without showing loading spinner
            setInterval(async () => {
                console.log('🔄 Refreshing whale data in background...');
                await Promise.all([
                    fetchWhaleData(),
                    fetchTaoPrice()
                ]);
                render(); // Update display with new data
            }, refreshInterval);
        }
        
        init();
        
    })();
    </script>
    <?php
    return ob_get_clean();
}

// ===== SHORTCODE REGISTRATIONS =====
add_shortcode('tao_whales', 'tao_whale_tracker_complete');

// ===== MANUAL CACHE CLEAR =====
// Add [clear_tao_cache] shortcode to manually clear cache (admin only)
add_shortcode('clear_tao_cache', function() {
    if (current_user_can('manage_options')) {
        tao_clear_all_caches();
        return '<div style="padding:1rem;background:#10b981;color:#fff;border-radius:8px;text-align:center;margin:2rem 0;">✅ TAO Cache Cleared! Fresh data will load on next page refresh.</div>';
    }
    return '';
});


?>
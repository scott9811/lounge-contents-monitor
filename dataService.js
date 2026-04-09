require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BRAND_NAMES = {
  2604: '마인드브릿지',
  2614: '지오지아 ZIOZIA',
  2687: '코드그라피',
  2580: '퍼퓸 드 말리',
  710:  'DOD',
  1098: 'VUNQUE',
  2400: 'SPOFL',
  2553: '미세키서울',
  2579: '88양조장',
  2600: '앙투어솔레',
  2607: '씨이오보떼',
  2630: '써코니(Saucony)',
  2631: 'COLDFRAME',
  2646: '글로니',
  2688: '키뮤어',
  2698: '비브람파이브핑거스',
  2700: '로우클래식',
  2712: '뚜오미오',
  2714: '세이브힐즈',
  2733: '케이스위스',
  996:  '로우로우 RAWROW',
  2329: '자이스비전코리아',
  2337: '르노 성수',
  2595: '마티에 프리미에르',
  2328: '헬렌카민스키',
  2629: '넘버링',
  2625: '바이위켄드',
  2422: '트래블메이트 TRAVELMATE',
  2331: '비쎌',
  2613: '밤켈',
  2632: '엘리트코리아',
  2635: 'MACKAGE',
  2732: '트리피언',
  2270: '킨치 KINCHI',
  2327: '엘씨디씨(LCDC)',
  1344: '아더에러 ADERERROR',
  2713: 'ADP 알렉산드르 드 파리',
  2719: 'RAINS KOREA',
  388:  'JDC제주공항 면세점',
  844:  '누니주얼리',
  1104: 'HUNTER',
  1154: '도나앤디',
  1276: '어반사이드',
  2303: '프린스 코리아',
  2344: '노스웍스 Northworks',
  2419: 'Mondemonde',
  2545: '한글안경',
  2563: 'CHRISTINE PROJECT',
  2585: '로긴앤로지',
  2599: '고저스리무진',
  2621: '에버에이유 EVERAU',
  1019: '에어버기 AIRBUGGY',
  1035: '프린트베이커리',
  1061: 'The옳음',
  1152: '라모드',
  1281: '코르딕스',
  1059: '워크리스 by 스미스S3',
  290:  'ETOINE',
  293:  '제이프리모',
  1351: '버미큘라',
  1952: 'CNmotors',
  2011: '미나브 minav',
  2094: '네이키드니스 NEIKIDNIS',
  2100: '리드볼트 LEADVAULT',
  2104: 'SSRL',
  2157: '큐랑 QRANG',
  2174: '플라디코 plaadico',
  2194: '에스실 SSIL',
  2207: '트라몬 TRAMON',
  44:   '포튼가먼트',
  486:  '루미너스랩',
  722:  '더웨어하우스',
  1153: '착한중고명품',
  1609: '지오몽',
  2189: '코코블랑',
  429:  '밀리터리기어',
  1518: '미앤비즈',
  1744: 'povera',
  1784: '본아페티',
  2048: '날아라꽃게',
  2233: '호카 HOKA',
};

const TARGET_BRANDS = [
  44, 290, 293, 388, 429, 486, 710, 722, 844, 996,
  1019, 1035, 1059, 1061, 1098, 1104, 1152, 1153, 1154, 1276,
  1281, 1344, 1351, 1518, 1609, 1744, 1784, 1952, 2011, 2048,
  2094, 2100, 2104, 2157, 2174, 2189, 2194, 2207, 2233, 2270,
  2303, 2327, 2328, 2329, 2331, 2337, 2344, 2400, 2419, 2422, 2545,
  2553, 2563, 2579, 2580, 2585, 2595, 2599, 2600, 2604, 2607,
  2613, 2614, 2621, 2625, 2629, 2630, 2631, 2632, 2635, 2646,
  2687, 2688, 2698, 2700, 2712, 2713, 2714, 2719, 2732, 2733
];

const BLOCK_LABELS = {
  'contents-highlight-banner': '강조 배너',
  'contents-2x2-banner': '2×2 배너',
  'contents-carousel': '캐러셀 배너',
  'contents-list-banner': '리스트 배너',
  'button-type-banner': '버튼형 배너',
  'service-channel-list': 'SNS 링크',
  'contents-youtube': '유튜브 임베드',
};


function getBrandName(brandIdx) {
  return BRAND_NAMES[Number(brandIdx)] || String(brandIdx);
}

function isContentModuleActive(tree) {
  const mainContainer = tree?.blocks?.['main-container'];
  return mainContainer?.type === 'tab-container';
}

function getContentBlocks(tree) {
  return getBlocksForBrand(tree).filter(b => b.type !== 'service-channel-list');
}

function getBlocksForBrand(tree) {
  const blocks = tree?.blocks || {};
  const mainContainer = blocks['main-container'];
  const result = [];

  if (!mainContainer) return result;

  // tab-container의 경우 tabs에서 children 수집
  // section-container의 경우 children에서 수집
  let blockKeys = [];

  if (mainContainer.type === 'tab-container') {
    const tabs = mainContainer.props?.tabs || [];
    for (const tab of tabs) {
      blockKeys.push(...(tab.children || []));
    }
  } else {
    blockKeys = mainContainer.children || [];
  }

  for (const key of blockKeys) {
    if (key === 'member-content-slot') continue;
    const block = blocks[key];
    if (!block) continue;
    result.push({ key, ...block });
  }

  return result;
}

function isRootUrl(url) {
  try {
    if (!url || url.trim() === '') return false;
    const u = new URL(url);
    return u.pathname === '/' || u.pathname === '/index.html' || u.pathname === '/index.php';
  } catch {
    return false;
  }
}

function detectUrlIssues(brandIdx, tree) {
  const issues = [];
  const blocks = tree?.blocks || {};
  const brandName = getBrandName(brandIdx);

  // service-channel-list 제외한 모든 link 수집
  const allLinks = []; // { url, blockLabel }
  for (const [, block] of Object.entries(blocks)) {
    if (block.type === 'service-channel-list') continue;
    const label = BLOCK_LABELS[block.type] || block.type;
    const props = block.props || {};

    const collect = (url) => {
      if (url && url.trim() !== '') allLinks.push({ url, blockLabel: label });
    };

    if (props.link) collect(props.link);
    for (const item of props.items || []) if (item.link) collect(item.link);
  }

  // 동일 URL 중복 3회 이상 (노랑)
  const urlCount = {};
  for (const { url } of allLinks) urlCount[url] = (urlCount[url] || 0) + 1;
  for (const [url, count] of Object.entries(urlCount)) {
    if (count >= 3) {
      const blockLabel = allLinks.find((l) => l.url === url)?.blockLabel || '';
      issues.push({ brandIdx, brandName, type: 'duplicate_url', typeLabel: `동일 URL 중복 (${count}회)`, color: 'yellow', blockLabel, url });
    }
  }

  return issues;
}

async function fetchAllRows() {
  const PAGE_SIZE = 1000;
  let allData = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('tb_ui_tree')
      .select('tree_idx, brand_idx, page_type, tree, created_at, updated_at')
      .order('brand_idx', { ascending: true })
      .in('brand_idx', TARGET_BRANDS)
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(`Supabase 조회 실패: ${error.message}`);
    allData.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return allData;
}

async function fetchDashboardData() {
  const data = await fetchAllRows();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // 브랜드별 최신 레코드만 유지 (brand_idx 기준)
  const brandMap = new Map();
  for (const row of data) {
    const existing = brandMap.get(String(row.brand_idx));
    if (!existing || new Date(row.updated_at) > new Date(existing.updated_at)) {
      brandMap.set(String(row.brand_idx), row);
    }
  }
  const rows = Array.from(brandMap.values());

  const totalBrands = rows.length;

  // 활성화 / 비활성화 브랜드
  const activeBrands = [];
  const inactiveBrands = [];
  for (const row of rows) {
    const active = isContentModuleActive(row.tree);
    const entry = {
      brandIdx: Number(row.brand_idx),
      brandName: getBrandName(row.brand_idx),
      updatedAt: row.updated_at,
    };
    if (active) activeBrands.push(entry);
    else inactiveBrands.push(entry);
  }

  // 최근 14일 내 변경
  const recentlyUpdated = rows
    .filter((r) => new Date(r.updated_at) >= sevenDaysAgo)
    .map((r) => ({
      brandIdx: Number(r.brand_idx),
      brandName: getBrandName(r.brand_idx),
      updatedAt: r.updated_at,
    }))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  // 블럭 유형별 총 사용 개수 + 브랜드별 목록
  const blockStats = {};
  const blockBrandMap = {}; // label -> [{brandIdx, brandName}]
  for (const row of rows) {
    const blocks = row.tree?.blocks || {};
    const seenLabels = new Set();
    for (const [, block] of Object.entries(blocks)) {
      if (block.type && BLOCK_LABELS[block.type]) {
        const label = BLOCK_LABELS[block.type];
        blockStats[label] = (blockStats[label] || 0) + 1;
        if (!seenLabels.has(label)) {
          seenLabels.add(label);
          if (!blockBrandMap[label]) blockBrandMap[label] = [];
          blockBrandMap[label].push({ brandIdx: Number(row.brand_idx), brandName: getBrandName(row.brand_idx) });
        }
      }
    }
  }

  // 배경 컬러 현황
  const DEFAULT_COLOR = '#f7f7f8';
  const defaultBrands = [];
  const customColorMap = new Map(); // hex -> [{brandIdx, brandName}]

  for (const row of rows) {
    const color = row.tree?.backgroundColor?.toLowerCase() || null;
    const isDefault = !color || color === DEFAULT_COLOR.toLowerCase();
    const entry = { brandIdx: Number(row.brand_idx), brandName: getBrandName(row.brand_idx) };

    if (isDefault) {
      defaultBrands.push(entry);
    } else {
      if (!customColorMap.has(color)) customColorMap.set(color, []);
      customColorMap.get(color).push(entry);
    }
  }

  const colorStats = {
    default: { color: DEFAULT_COLOR, brands: defaultBrands },
    custom: Array.from(customColorMap.entries()).map(([hex, brands]) => ({ color: hex, brands })),
  };

  // 브랜드별 블럭 상세 (활성화 브랜드만)
  const brandDetails = rows
    .filter((row) => isContentModuleActive(row.tree))
    .map((row) => {
      const blocks = getBlocksForBrand(row.tree);
      return {
        brandIdx: Number(row.brand_idx),
        brandName: getBrandName(row.brand_idx),
        active: true,
        updatedAt: row.updated_at,
        createdAt: row.created_at,
        backgroundColor: row.tree?.backgroundColor || null,
        blocks: blocks.map((b) => ({
          key: b.key,
          type: b.type,
          typeLabel: BLOCK_LABELS[b.type] || b.type,
          visible: b.visible !== false,
          props: b.props || {},
        })),
      };
    });

  // URL 문제 감지
  const urlIssues = [];
  for (const row of rows) {
    const issues = detectUrlIssues(row.brand_idx, row.tree);
    urlIssues.push(...issues);
  }

  const urlIssueBrandCount = new Set(urlIssues.map((i) => i.brandIdx)).size;

  // 섹션 06: 숨김 블럭만 있는 브랜드 (활성화 브랜드 중, service-channel-list 제외)
  const allHiddenBrands = [];
  // 섹션 07: 블럭이 없는 브랜드 (활성화 브랜드 중, service-channel-list 제외)
  const noBlockBrands = [];

  for (const row of rows) {
    if (!isContentModuleActive(row.tree)) continue;
    const blocks = getContentBlocks(row.tree);
    const entry = {
      brandIdx: Number(row.brand_idx),
      brandName: getBrandName(row.brand_idx),
      updatedAt: row.updated_at,
      blockCount: blocks.length,
    };
    if (blocks.length === 0) {
      noBlockBrands.push(entry);
    } else if (blocks.every((b) => b.visible === false)) {
      allHiddenBrands.push(entry);
    }
  }

  // 섹션 09: 30일 이상 미업데이트 브랜드 (오래된 순 정렬)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const longInactiveBrands = rows
    .filter((r) => new Date(r.updated_at) < thirtyDaysAgo)
    .map((r) => ({
      brandIdx: Number(r.brand_idx),
      brandName: getBrandName(r.brand_idx),
      updatedAt: r.updated_at,
    }))
    .sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));

  return {
    lastUpdated: now.toISOString(),
    totalBrands,
    activeContentModule: activeBrands.length,
    recentlyUpdatedCount: recentlyUpdated.length,
    urlIssueBrandCount,
    activeBrands,
    inactiveBrands,
    recentlyUpdated,
    blockStats,
    blockBrandMap,
    colorStats,
    brandDetails,
    urlIssues,
    allHiddenBrands,
    noBlockBrands,
    longInactiveBrands,
  };
}

module.exports = { fetchDashboardData };

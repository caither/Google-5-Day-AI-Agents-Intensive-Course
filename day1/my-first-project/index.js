import * as cheerio from 'cheerio';
import pc from 'picocolors';
import open from 'open';
import readline from 'readline';

const URL = 'https://technews.tw/';

async function fetchNews() {
  console.log(pc.cyan('正在取得 科技新報 (TechNews) 最新頭條...'));
  try {
    const response = await fetch(URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP 錯誤! 狀態碼: ${response.status}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    const articles = [];
    const seenUrls = new Set();

    $('h1.entry-title a').each((i, el) => {
      const title = $(el).attr('title') || $(el).text();
      const href = $(el).attr('href');
      if (title && href && !seenUrls.has(href)) {
        seenUrls.add(href);
        articles.push({
          title: title.trim(),
          url: href.trim()
        });
      }
    });

    return articles;
  } catch (error) {
    console.error(pc.red(`取得新聞失敗: ${error.message}`));
    process.exit(1);
  }
}

async function main() {
  const articles = await fetchNews();
  if (articles.length === 0) {
    console.log(pc.yellow('沒有找到任何新聞文章。'));
    process.exit(0);
  }

  console.log('\n' + pc.bold(pc.bgCyan(pc.black('  科技新報 (TechNews) 最新頭條清單  '))) + '\n');
  articles.forEach((art, index) => {
    console.log(`${pc.green(`[${index + 1}]`)} ${pc.white(art.title)}`);
  });
  console.log('');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const promptUser = () => {
    rl.question(pc.cyan('請輸入文章編號以在瀏覽器中開啟 (或輸入 q 離開): '), async (answer) => {
      const trimmed = answer.trim().toLowerCase();
      if (trimmed === 'q' || trimmed === 'quit' || trimmed === 'exit') {
        console.log(pc.yellow('掰掰！'));
        rl.close();
        process.exit(0);
      }

      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 1 && num <= articles.length) {
        const selected = articles[num - 1];
        console.log(pc.green(`正在開啟: ${pc.underline(selected.title)}...`));
        try {
          await open(selected.url);
        } catch (err) {
          console.error(pc.red(`無法開啟瀏覽器: ${err.message}`));
          console.log(`文章連結: ${pc.underline(selected.url)}`);
        }
        promptUser();
      } else {
        console.log(pc.red('無效的輸入，請再試一次。'));
        promptUser();
      }
    });
  };

  promptUser();
}

main();

# Fairy Import Pilot Sources

Updated: 2026-03-17

This registry tracks the 20 active fairy tales that now drive the bookshelf pilot. Story content is stored in local curated data, while each entry keeps its Project Gutenberg source metadata for later DB import and audit work. The current shelf does not blindly display these source images; it only keeps them as provenance targets until a story-specific cover is manually verified.

## Active 20

| Rank | Slug | Book | Source | Cover target |
| --- | --- | --- | --- | --- |
| 1 | `fairy-little-red-riding-hood` | 小红帽 | https://www.gutenberg.org/ebooks/33931 | https://www.gutenberg.org/cache/epub/33931/images/p0593_lg.jpg |
| 2 | `fairy-cinderella` | 灰姑娘 | https://www.gutenberg.org/ebooks/33931 | https://www.gutenberg.org/cache/epub/33931/images/p0005_lg.jpg |
| 3 | `fairy-snow-white` | 白雪公主 | https://www.gutenberg.org/ebooks/20748 | https://www.gutenberg.org/cache/epub/20748/images/page_005.png |
| 4 | `fairy-sleeping-beauty` | 睡美人 | https://www.gutenberg.org/ebooks/33931 | https://www.gutenberg.org/cache/epub/33931/images/ifrontis.jpg |
| 5 | `fairy-hansel-and-gretel` | 汉塞尔与格蕾特 | https://www.gutenberg.org/ebooks/20748 | https://www.gutenberg.org/cache/epub/20748/images/page_049.png |
| 6 | `fairy-puss-in-boots` | 穿靴子的猫 | https://www.gutenberg.org/ebooks/33931 | https://www.gutenberg.org/cache/epub/33931/images/p0149_lg.jpg |
| 7 | `fairy-beauty-and-the-beast` | 美女与野兽 | https://www.gutenberg.org/ebooks/20748 | https://www.gutenberg.org/cache/epub/20748/images/page_030.png |
| 8 | `fairy-bluebeard` | 蓝胡子 | https://www.gutenberg.org/ebooks/33931 | https://www.gutenberg.org/cache/epub/33931/images/p0359_lg.jpg |
| 9 | `fairy-jack-and-the-beanstalk` | 杰克和魔豆 | https://www.gutenberg.org/ebooks/20748 | https://www.gutenberg.org/cache/epub/20748/images/page_039.png |
| 10 | `fairy-goldilocks-and-the-three-bears` | 金发姑娘和三只熊 | https://www.gutenberg.org/ebooks/20748 | https://www.gutenberg.org/cache/epub/20748/images/page_022.png |
| 11 | `fairy-the-ugly-duckling` | 丑小鸭 | https://www.gutenberg.org/ebooks/20748 | https://www.gutenberg.org/cache/epub/20748/images/page_008.png |
| 12 | `fairy-the-little-match-girl` | 卖火柴的小女孩 | https://www.gutenberg.org/ebooks/20748 | https://www.gutenberg.org/cache/epub/20748/images/page_026.png |
| 13 | `fairy-aladdin-and-the-magic-lamp` | 阿拉丁和神灯 | https://www.gutenberg.org/ebooks/20748 | https://www.gutenberg.org/cache/epub/20748/images/page_011.png |
| 14 | `fairy-the-little-mermaid` | 海的女儿 | https://www.gutenberg.org/ebooks/17860 | https://www.gutenberg.org/cache/epub/17860/images/plate3.jpg |
| 15 | `fairy-the-wild-swans` | 野天鹅 | https://www.gutenberg.org/ebooks/17860 | https://www.gutenberg.org/cache/epub/17860/images/plate32.jpg |
| 16 | `fairy-the-snow-queen` | 雪女王 | https://www.gutenberg.org/ebooks/17860 | https://www.gutenberg.org/cache/epub/17860/images/plate23.jpg |
| 17 | `fairy-rapunzel` | 莴苣姑娘 | https://www.gutenberg.org/ebooks/2591 | https://www.gutenberg.org/ebooks/2591 |
| 18 | `fairy-bremen-town-musicians` | 不来梅的音乐家 | https://www.gutenberg.org/ebooks/2591 | https://www.gutenberg.org/ebooks/2591 |
| 19 | `fairy-the-three-little-pigs` | 三只小猪 | https://www.gutenberg.org/ebooks/7439 | https://www.gutenberg.org/ebooks/7439 |
| 20 | `fairy-the-golden-goose` | 金鹅 | https://www.gutenberg.org/ebooks/2591 | https://www.gutenberg.org/ebooks/2591 |

## Notes

- All entries are tagged as `Project Gutenberg` with `Public domain in the USA via Project Gutenberg`.
- The current runtime pilot uses locally curated Chinese story content plus source metadata. A future offline import can move the same dataset into `story_books` once DB migrations are applied.
- The shelf now defaults back to curated or local covers for the pilot books. Project Gutenberg image targets are kept here for audit and future manual vetting, not forced directly into the UI.

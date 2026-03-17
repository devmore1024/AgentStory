# Home Cover Source Registry

Updated: 2026-03-16

This registry now covers the full active bookshelf. Every book cover first tries a curated external public-domain or reuse-friendly artwork and only falls back to the local `/covers/[slug]` SVG route if the remote image fails.

## How Full Coverage Works

- Exact-match books use `slugCoverOverrides` for stronger story fit.
- Remaining books flow through `inferCoverMotif(...)` and pick from a themed artwork pool.
- If a future book cannot be themed, the app still falls back to the local SVG cover.

## Slug Overrides

| Slug | Book | Artwork source |
| --- | --- | --- |
| `fairy-little-red-riding-hood` | 小红帽 | Arthur Rackham - Little Red Riding Hood |
| `fairy-the-three-little-pigs` | 三只小猪 | Three little pigs 1904 straw house |
| `fairy-bremen-town-musicians` | 不来梅的音乐家 | The Bremen Town Musicians by John D. Batten |
| `fairy-the-ugly-duckling` | 丑小鸭 | The Ugly Duckling cropped |
| `fairy-sleeping-beauty` | 睡美人 | Edmund Dulac Sleeping Beauty |
| `fairy-cinderella` | 灰姑娘 | Cinderella - Project Gutenberg |
| `fairy-snow-white` | 白雪公主 | Snow White Mirror 4 |
| `fairy-rapunzel` | 莴苣姑娘 | Arthur Rackham Rapunzel |
| `fairy-the-little-mermaid` | 海的女儿 | Vilhelm Pedersen - Little mermaid |
| `fairy-the-wild-swans` | 野天鹅 | Pollard The Wild Swans |
| `fairy-the-golden-goose` | 金鹅 | Otto Ubbelohde - Die goldene Gans 1909 |
| `fable-the-goose-that-laid-the-golden-eggs` | 下金蛋的鹅 | Otto Ubbelohde - Die goldene Gans 1909 |
| `fable-dongshi-imitates-xishi` | 东施效颦 | 美人百态画谱之西施 |
| `fable-the-crow-and-the-fox` | 乌鸦和狐狸 | Fox and crow |
| `fable-the-thirsty-crow` | 乌鸦喝水 | The Crow and the Pitcher |
| `fable-the-fox-and-the-grapes` | 狐狸和葡萄 | The Fox and the Grapes |
| `fable-the-lion-and-the-mouse` | 狮子和老鼠 | The Lion and the Mouse |
| `fable-the-ant-and-the-grasshopper` | 蚂蚁和蚱蜢 | The Ant and the Grasshopper |
| `fable-the-tortoise-and-the-hare` | 龟兔赛跑 | The Tortoise and the Hare |
| `fable-the-guizhou-donkey-has-exhausted-its-tricks` | 黔驴技穷 | Fable-Esope-Rackham-02 |
| `myth-cangjie-invents-writing` | 仓颉造字 | Cangjie2 |
| `myth-daedalus-and-icarus` | 代达罗斯与伊卡洛斯 | Orazio Riminaldi - Daedalus and Icarus |
| `myth-gonggong-crashes-into-buzhou-mountain` | 共工怒触不周山 | Shan Hai Jing illustration |
| `myth-xingtian-defies-heaven` | 刑天舞干戚 | Jiang Yinghao - Xingtian |
| `myth-prometheus-steals-fire` | 普罗米修斯盗火 | Heinrich Fuger - Prometheus brings fire to mankind |
| `myth-theseus-and-the-minotaur` | 忒修斯与米诺陶洛斯 | Theseus Fighting the Minotaur |
| `myth-apollo-and-daphne` | 阿波罗与达芙妮 | Apollo with Lyre |

## Motif Pools

These pools are used for the rest of the shelf so the whole catalog gets external cover art without hardcoding all 99 books.

| Motif | Representative artworks |
| --- | --- |
| `forest` | Arthur Rackham - Little Red Riding Hood, Three little pigs 1904 straw house, Bremen Town Musicians, Arthur Rackham Rapunzel |
| `castle` | Edmund Dulac Sleeping Beauty, Snow White Mirror 4, Pollard The Wild Swans |
| `sea` | Vilhelm Pedersen - Little mermaid |
| `moonbird` | Edmund Dulac - The Nightingale 5 |
| `shoe` | Cinderella - Project Gutenberg |
| `mirror` | Snow White Mirror 4 |
| `tower` | Arthur Rackham Rapunzel |
| `swan` | Pollard The Wild Swans, Otto Ubbelohde - Die goldene Gans 1909 |
| `fox` | Fox and crow, The Fox and the Grapes, The Crow and the Pitcher, The Lion and the Mouse, Fable-Esope-Rackham-02 |
| `lion` | The Lion and the Mouse |
| `hare` | The Tortoise and the Hare |
| `grapes` | The Fox and the Grapes |
| `ant` | The Ant and the Grasshopper |
| `tortoise` | The Tortoise and the Hare |
| `crow` | The Crow and the Pitcher, Fox and crow |
| `donkey` | Fable-Esope-Rackham-02 |
| `fire` | Heinrich Fuger - Prometheus brings fire to mankind |
| `lightning` | Paolo Veronese - Jupiter Hurling Thunderbolts, Jiang Yinghao - Xingtian, Cangjie2, Theseus Fighting the Minotaur, Apollo with Lyre, Poseidon |
| `maze` | Theseus Fighting the Minotaur |
| `wings` | Orazio Riminaldi - Daedalus and Icarus |
| `trident` | Poseidon |
| `owl` | Bronze statuette of Athena flying her owl |
| `lyre` | Apollo with Lyre |

## Verified Source Pages

- [Arthur Rackham - Little Red Riding Hood](https://commons.wikimedia.org/wiki/File:Arthur_Rackham_Little_Red_Riding_Hood_1.jpg)
- [Edmund Dulac - The Nightingale 5](https://commons.wikimedia.org/wiki/File:Edmund_Dulac_-_The_Nightingale_5.jpg)
- [Vilhelm Pedersen - Little mermaid](https://commons.wikimedia.org/wiki/File:Vilhelm_Pedersen-Little_mermaid.jpg)
- [Cinderella - Project Gutenberg](https://commons.wikimedia.org/wiki/File:Cinderella_-_Project_Gutenberg_etext_19993.jpg)
- [Snow White Mirror 4](https://commons.wikimedia.org/wiki/File:Snow_White_Mirror_4.png)
- [Arthur Rackham Rapunzel](https://commons.wikimedia.org/wiki/File:Arthur_Rackham_Rapunzel.jpg)
- [Edmund Dulac Sleeping Beauty](https://commons.wikimedia.org/wiki/File:Edmund_Dulac_Sleeping_Beauty.jpg)
- [The Fox and the Grapes](https://commons.wikimedia.org/wiki/File:The_Fox_and_the_Grapes_-_Project_Gutenberg_etext_19994.jpg)
- [The Lion and the Mouse](https://commons.wikimedia.org/wiki/File:The_Lion_and_the_Mouse_-_Project_Gutenberg_etext_19994.jpg)
- [The Ant and the Grasshopper](https://commons.wikimedia.org/wiki/File:The_Ant_and_the_Grasshopper_-_Project_Gutenberg_etext_19994.jpg)
- [The Tortoise and the Hare](https://commons.wikimedia.org/wiki/File:The_Tortoise_and_the_Hare_-_Project_Gutenberg_etext_19994.jpg)
- [Heinrich Fuger - Prometheus brings fire to mankind](https://commons.wikimedia.org/wiki/File:Heinrich_fueger_1817_prometheus_brings_fire_to_mankind.jpg)
- [Paolo Veronese - Jupiter Hurling Thunderbolts at the Vices](https://commons.wikimedia.org/wiki/File:Paolo_Veronese_-_Jupiter_Hurling_Thunderbolts_at_the_Vices_-_WGA24935.jpg)
- [Apollo with Lyre](https://commons.wikimedia.org/wiki/File:Apollo_with_Lyre_MET_DP-38-001.jpg)
- [Bronze statuette of Athena flying her owl](https://commons.wikimedia.org/wiki/File:Bronze_statuette_of_Athena_flying_her_owl_MET_DP324650.jpg)

## License Direction

- Commons files used here are either public domain, Project Gutenberg public domain, museum open-access / CC0, or faithful reproductions of public-domain works.
- Direct commercial publisher covers remain out of scope and are not used for the live bookshelf.

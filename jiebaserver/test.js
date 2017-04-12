var request = require("request")

var url = "http://exp-linked-data-proxy-2017.dlll.nccu.edu.tw/check/wiki,moedict,cbdb,tgaz,cdict,pixabay/" ;

var qstring ='五 巻 寫 情 集 暨 春秋 明經 各 四 巻 其 孫 廌 集 御書 及 狀 序 諸 作 曰 翊 運 録 皆 鋟 梓 行 世 然 諸 集 渙 而 無 統 板畫 久 而 寖 湮 學者 病 之 巡 浙 御史 戴 君 用 與其 寀 薛 君 謙 楊 君 琅 謀 重 鋟 廼 録 善本 次第 諸 集 而 冠以 翊 運 録 俾 杭 郡守 張 君 僖 成 之 屬 守 陳 序 維 公 以 命 世豪傑 之 才 出 佐 我 高 皇 剪 羣雄 混 六合 讜 言 谹 議 牖 道 天 � � 偉 略 竒 謀 指 授 羣 帥 者 鼎 彞 勒 之 汗 青 書 之 四方 尚能 道 之 方 其 未 遇 也 鬱積 感 憤發 之 文辭 若 四嶽 之 出雲 無 窮 若 公輸 之 營 衆 宇 各盡其 制 若 孫武子 之 師 戈 甲 蔽野 而 不 聞 喑 嗚 叱咤 之 聲 若 大海 浩 溔 中 畜 虬 螭 䱎 䲛 ● ● 之 屬 覩 者 眙 ● 而 莫 能 名 然 皆 載道 之 航 輪 濟世 之 粱 帛 時 已 傳誦 之 及 逹 而 施 之 朝 廟 播 之 華夷 埀 之 百世 之下 焯 乎 不可 朽 也 三代 之 英 卓 矣 漢 以 降 佐 命 元 勲 多 崛起 草莽 甲 兵 間 諳 文墨 者 殊 鮮 子房 之 䇿 不見 辭章 元 齡 之 文 僅 辦 符 檄 未 見 樹 開 國 之 勲 業 而 兼 傳世 之 文章 如 公 者 公 可謂 千古 之 人豪 矣 而 世 或 疑 其 仕 元 或 獨 稱 其 觀象 者 是 猶 訾 伊 尹 之 五 就 知 周 公 止於 才藝 而已 不 亦 陋 乎 三 御史 之 重 鋟 兹 集 蓋 高山景行 之 志 也 守 陳 之 序 居 培 塿 而論 嵩 岱 持 土 苴 而 寘 之 夜光 朝 采 之上 可 乎 哉 成化 六年 夏 六月 四明 楊 守 陳 序';
var qq='五 巻 寫 情 集 暨 春秋 明經 各 四 巻 其 孫 廌 集';

var options={
	url: url,
	timeout:120000,
    method:'POST',
    json: {query:qstring}
}

request(options, function (error, response, body) {

    if (!error && response.statusCode === 200) {
        if(body===undefined){
        	
        }
        console.log(body) // Print the json response
    }
})





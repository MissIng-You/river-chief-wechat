/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名 cwmq5bvw.qcloud.la  1fwkqz0p.qcloud.la
var host = 'https://1fwkqz0p.qcloud.la';

// var host = 'https://372563207.cdwanjiangtech.com';

// 河长制Wechat API地址
// var apiHost = 'http://171.221.202.126:30001/api';

// var apiHost = 'https://www.cdwanjiangtech.com/api';

var apiHost = 'https://hz.enlitesoftware.com/api';

var config = {

    // 下面的地址配合云端 Demo 工作
    service: {
        host,

        // 登录地址，用于建立会话
        loginUrl: `${host}/weapp/login`,

        // 测试的请求地址，用于测试会话
        requestUrl: `${host}/weapp/user`,

        // 测试的信道服务地址
        tunnelUrl: `${host}/weapp/tunnel`,

        // 上传图片接口
        // uploadUrl: `${host}/weapp/upload`,

        // api服务器图片/视频接口
        uploadUrl: `${apiHost}/Common/UploadFile?accessToken=''&fileType=0`,
        uploadVideoUrl: `${apiHost}/Common/UploadFile?accessToken=''&fileType=1`,

        // 获取本月护河大使Top10
        getRanks: `${apiHost}/WeChat/GetRankOfThisMonthList`,

        // 获取热门问题上报
        getHotProblems: `${apiHost}/WeChat/QueryMassesReportList`,

        // 获取我的/Ta的问题
        getMyProblems: `${apiHost}/WeChat/MyMassesReportList`,

        // 获取问题详情
        getProblemDetails: `${apiHost}/WeChat/GetReportsByMassesReportsId`,

        // 大众河长问题上报
        upreportProblem: `${apiHost}/WeChat/InsertMassesReport`,

        // 获取我管理的河流
        getRivers: `${apiHost}/WeChat/GetReachInfoListByWeChatId`,

        // 获取用户账户信息
        getUserInfo: `${apiHost}/WeChat/GetWeChatUserByWeChatId`,

        // 注册用户
        registerUser: `${apiHost}/WeChat/InsertWeChatUser`,

        // 获取行政区划
        getAreas: `${apiHost}/Common/GetChildAreaByParentName`,

        // 获取河段信息
        getReaches: `${apiHost}/Common/GetReachListByAreaCode`,

    },

    // 配置常量信息
    constant: {
      areas: '锦江区,青羊区,金牛区,武侯区,成华区,龙泉驿区,青白江区,新都区,温江区,双流区,金堂县,郫县,大邑县,蒲江县,新津县,都江堰市,彭州市,邛崃市,崇州市,简阳市,自流井区,贡井区,大安区,沿滩区,荣县,富顺县,东区,西区,仁和区,米易县,盐边县,江阳区,纳溪区,龙马潭区,泸县,合江县,叙永县,古蔺县,旌阳区,中江县,罗江县,广汉市,什邡市,绵竹市,涪城区,游仙区,安州区,三台县,盐亭县,梓潼县,北川羌族自治县,平武县,江油市,利州区,昭化区,朝天区,旺苍县,青川县,剑阁县,苍溪县,船山区,安居区,蓬溪县,射洪县,大英县,市中区,东兴区,威远县,资中县,隆昌县,市中区,沙湾区,五通桥区,金口河区,犍为县,井研县,夹江县,沐川县,峨边彝族自治县,马边彝族自治县,峨眉山市,顺庆区,高坪区,嘉陵区,南部县,营山县,蓬安县,仪陇县,西充县,阆中市,东坡区,彭山区,仁寿县,洪雅县,丹棱县,青神县,翠屏区,南溪区,宜宾县,江安县,长宁县,高县,珙县,筠连县,兴文县,屏山县,广安区,前锋区,岳池县,武胜县,邻水县,华蓥市,通川区,达川区,宣汉县,开江县,大竹县,渠县,万源市,雨城区,名山区,荥经县,汉源县,石棉县,天全县,芦山县,宝兴县,巴州区,恩阳区,通江县,南江县,平昌县,雁江区,安岳县,乐至县,马尔康市,汶川县,理县,茂县,松潘县,九寨沟县,金川县,小金县,黑水县,壤塘县,阿坝县,若尔盖县,红原县,康定市,泸定县,丹巴县,九龙县,雅江县,道孚县,炉霍县,甘孜县,新龙县,德格县,白玉县,石渠县,色达县,理塘县,巴塘县,乡城县,稻城县,得荣县,西昌市,木里藏族自治县,盐源县,德昌县,会理县,会东县,宁南县,普格县,布拖县,金阳县,昭觉县,喜德县,冕宁县,越西县,甘洛县,美姑县,雷波县'.split(','),
      cities: '成都市,自贡市,攀枝花市,泸州市,德阳市,绵阳市,广元市,遂宁市,内江市,乐山市,南充市,眉山市,宜宾市,广安市,达州市,雅安市,巴中市,资阳市,阿坝藏族羌族自治州,甘孜藏族自治州,凉山彝族自治州'.split(',')
    }
};

module.exports = config;
const CONF = {
    port: '5757',
    rootPathname: '',

    // 微信小程序 App ID wx2975c08e1489e147  wxeabcbc074271ab44
    appId: 'wxeabcbc074271ab44',

    // 微信小程序 App Secret 8536207995dad67c4f982f9a81d3a5bc  0c523bc802e919565170655e75106190
    appSecret: '0c523bc802e919565170655e75106190',

    // 是否使用腾讯云代理登录小程序
    useQcloudLogin: true,

    /**
     * MySQL 配置，用来存储 session 和用户信息
     * 若使用了腾讯云微信小程序解决方案
     * 开发环境下，MySQL 的初始密码为您的微信小程序 appid
     */
    mysql: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        db: 'cAuth',
        pass: 'wxeabcbc074271ab44',  // TY6J180C14748  wxeabcbc074271ab44
        char: 'utf8mb4'
    },

    cos: {
        /**
         * 区域
         * 华北：cn-north
         * 华东：cn-east
         * 华南：cn-south
         * 西南：cn-southwest
         * 新加坡：sg
         * @see https://www.qcloud.com/document/product/436/6224
         */
        region: 'cn-south',
        // Bucket 名称
        fileBucket: 'wximg',
        // 文件夹
        uploadFolder: ''
    },

    // 微信登录态有效期
    wxLoginExpires: 1
}

module.exports = process.env.NODE_ENV === 'local' ? Object.assign({}, CONF, require('./config.local')) : CONF;

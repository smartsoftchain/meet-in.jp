// 本番
if(window.location.host === 'meet-in.jp') {
window.__SKYWAY_KEY__ = '736e5d28-a115-4823-a027-02688643952d';
} else if(window.location.host === 'online.sales-crowd.jp') {
window.__SKYWAY_KEY__ = 'e7ee169c-0a48-43cf-8b61-449a68b99b96';
}
// STG
 else if(window.location.host === 'stage.meet-in.jp') {
 window.__SKYWAY_KEY__ = '726dc6b1-5407-429d-ab74-aa7b53992848';
} else if(window.location.host === 'demo.sales-crowd.jp') {
window.__SKYWAY_KEY__ = '726dc6b1-5407-429d-ab74-aa7b53992848';
}
// 開発
 else if((window.location.host === 'delphinus.sense.co.jp') || (window.location.host === 'delphinus2.sense.co.jp')) {
window.__SKYWAY_KEY__ = '48056165-ccdd-4322-87a3-74715536a9aa';
} else {    // その他(開発SC)
window.__SKYWAY_KEY__ = '48056165-ccdd-4322-87a3-74715536a9aa';
}

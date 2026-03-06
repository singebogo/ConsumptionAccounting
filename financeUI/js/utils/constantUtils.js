const remoter = '127.0.0.1';
const host = '8000';
const base_url = 'http://'+remoter+':'+ host;

const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${remoter}:${host}/ws/notifications/`;

const login_url = base_url + '/Authlogin/login/';
const logout_url = base_url + '/Authlogin/logout/';
const reg_url = base_url + '/Authlogin/reg/';
const userSearch_url = base_url + '/Authlogin/api/users/search/';
const userId_url = base_url + '/Authlogin/api/users/';
const AuthloginMessagesId_url = base_url + '/Authlogin/api/messages/';

const DailyinoutChange_url = base_url + '/DailyInout/DailyinoutChange/';
const DailyinoutAllQuery_url = base_url + '/DailyInout/DailyinoutAll/';
const DailyinoutDelete_url = base_url + '/DailyInout/DailyinoutDelete/';
const DailyinoutCodeTypeQuery_url = base_url + '/infrastruct/vaildCodeTypeQuery/';
const DailyinoutCodeQuery_url = base_url + '/infrastruct/vaildCodeQuery/';
const DailyinoutblukCreate_url = base_url + '/DailyInout/blukCreate/';

const limitTypeMetrics_url = base_url + '/Metrics/limitTypeMetrics/';
const MetricsAllQuery_url = base_url + '/Metrics/MetricsAll/';
const MetricsDelete_url = base_url + '/Metrics/MetricsDelete/';

const DataPresentation_url = base_url + '/DataPresentation/DataPresentation/';
const DataPrsentQueryPrimary_url = base_url + '/DataPresentation/DataPrsentQueryPrimary/';

const messagesId_url = base_url + '/notification/api/messages/';
const messagesSend_url = base_url + '/notification/api/messages/send/';
const notificationMessagesStar_url = base_url + '/notification/api/messages/star/';
const notificationMessagesDelete_url = base_url + '/notification/api/messages/delete/';
const notificationUserInfo_url = base_url + '/notification/api/user/info/';
const notificationUsers_url = base_url + '/notification/api/users/';

const NOTIFICATION_LIST_url =  base_url + '/notification/api/notifications/';
const NOTIFICATION_MARK_READ_url =  base_url + '/notification/api/notifications/mark-read/';
const NOTIFICATION_MARK_ALL_READ_url = base_url + '/notification/api/notifications/mark-all-read/';
const NOTIFICATION_DELETE_url =  base_url + '/notification/api/notifications/delete/';
const MESSAGE_LIST_url =  base_url + '/notification/api/messages/';
const MESSAGE_MARK_READ_url =  base_url + '/notification/api/messages/mark-read/';
const UNREAD_COUNT_url =  base_url + '/notification/api/unread/count/';

const infrastructCodeChange_url = base_url + '/infrastruct/CodeChange/';
const infrastructCodeTypeChange_url = base_url + '/infrastruct/CodetypeChange/';
const infrastructQuery_url = base_url + '/infrastruct/CodeAll/';
const infrastructdelete_url = base_url + '/infrastruct/CodeDelete/';
const infrastructCodetypeAll_url = base_url + '/infrastruct/CodetypeAll/';
const infrastructCodetypeDelete_url = base_url + '/infrastruct/CodetypeDelete/';
const infrastructCodeTypeIsExist_url = base_url + '/infrastruct/CodeTypeIsExist/';
const infrastructCodeIsExist_url = base_url + '/infrastruct/CodeIsExist/';


const OverviewEveryDay_url = base_url + '/Overview/everyDay/';
const OverviewCurMonth_url = base_url + '/Overview/curMonth/';
const OverviewCurYear_url = base_url + '/Overview/curYear/';
const OverviewSevenDay_url = base_url + '/Overview/sevenDay/';


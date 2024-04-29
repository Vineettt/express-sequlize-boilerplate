const caseExpression: any = {
  STATUS_SWITCH_CASE:
    "CASE WHEN users.status = '-1' THEN 'ACTIVATION PENDING' WHEN users.status = '0' THEN 'ACCOUNT ACTIVATED' ELSE 'ACCOUNT STATUS UNKNOW' END",
};

module.exports = caseExpression;

const queryMapping:  any = {
    "ROLE_MAPPING_USER_ID": "select * from `role-route-mappings` rrm JOIN roles rls ON rrm.role_fk_id = rls.id JOIN routes rts ON rrm.route_fk_id = rts.id JOIN users ur ON ur.role_id = rls.id WHERE ur.id = :user_id and rts.endpoint = :endpoint and rts.method = :method",
    "USER_PERMISSIONS": "select rts.endpoint, rts.method from `role-route-mappings` rrm JOIN routes rts ON rrm.route_fk_id = rts.id where role_fk_id = :role_id"
}

module.exports = queryMapping;


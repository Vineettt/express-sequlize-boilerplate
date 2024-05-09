import config from "../../config/index";
const { dbNameMapping } = config();

const queryMapping:  any = {
    "ROLE_MAPPING_USER_ID": `select * from ${dbNameMapping['PBAC']}.role_route_mappings rrm JOIN ${dbNameMapping['PBAC']}.roles rls ON rrm.role_fk_id = rls.id JOIN ${dbNameMapping['PBAC']}.routes rts ON rrm.route_fk_id = rts.id JOIN ${dbNameMapping['PBAC']}.user_role_mappings urm ON urm.role_fk_id = rrm.role_fk_id WHERE urm.user_fk_id = :user_id and rts.endpoint = :endpoint and rts.method = :method`,
    "USER_ROLES": `select role from ${dbNameMapping['PBAC']}.roles r JOIN ${dbNameMapping['PBAC']}.user_role_mappings urm ON urm.role_fk_id = r.id where urm.user_fk_id = :user_fk_id`,
    "USER_PERMISSIONS": `select rts.endpoint, rts.method from ${dbNameMapping['PBAC']}.role_route_mappings rrm JOIN ${dbNameMapping['PBAC']}.routes rts ON rrm.route_fk_id = rts.id JOIN ${dbNameMapping['PBAC']}.user_role_mappings urm ON urm.role_fk_id = rrm.role_fk_id where urm.user_fk_id = :user_fk_id`
}

module.exports = queryMapping;
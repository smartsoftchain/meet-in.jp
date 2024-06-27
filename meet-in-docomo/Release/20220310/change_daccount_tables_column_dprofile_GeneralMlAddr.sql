# 招待メールの保存.
ALTER TABLE master_staff_invitation CHANGE COLUMN dprofile_GeneralMlAddr dprofile_email varchar;
# daccount提供データ.
ALTER TABLE collaborative_services_provided_data CHANGE COLUMN dprofile_GeneralMlAddr dprofile_email varchar;

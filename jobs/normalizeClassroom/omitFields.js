
'use strict';

const {omit} = require('ramda');

module.exports = omit(
	['_id', 'tutor_picture_url', 'cla_live_class_template_id', 'crc_regist_count', 'cla_level_id', 'cla_class_type', 'tea_picture_url','cla_live_class_time_id', 'cla_subject_ids', 'cla_area_id', 'cla_is_double_teacher_live_class', 'dept_name', 'cla_is_live_class', 'cla_gt_id','cla_recommend_number_MD5', 'cla_term_id', 'cla_grade_id', 'show_teacher_list', 'regist_Time', 'domain', 'cla_quota_num', 'groupId', 'gradeId','page', 'cityCode', 'isOpen', 'cla_subject_names','cla_name', 'cla_tutor_real_name', 'tea_teacher_name', 'cla_year', 'cla_level_name', 'cla_teacher_names', 'cla_start_date', 'cla_term_name']
);

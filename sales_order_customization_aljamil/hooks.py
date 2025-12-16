app_name = "sales_order_customization_aljamil"
app_title = "Sales Order Customization Aljamil"
app_publisher = "abdopcnet@gmail.com"
app_description = "Sales Order Customization Aljamil"
app_email = "abdopcnet@gmail.com"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "sales_order_customization_aljamil",
# 		"logo": "/assets/sales_order_customization_aljamil/logo.png",
# 		"title": "Sales Order Customization Aljamil",
# 		"route": "/sales_order_customization_aljamil",
# 		"has_permission": "sales_order_customization_aljamil.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/sales_order_customization_aljamil/css/sales_order_customization_aljamil.css"
# app_include_js = "/assets/sales_order_customization_aljamil/js/sales_order_customization_aljamil.js"

# include js, css files in header of web template
# web_include_css = "/assets/sales_order_customization_aljamil/css/sales_order_customization_aljamil.css"
# web_include_js = "/assets/sales_order_customization_aljamil/js/sales_order_customization_aljamil.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "sales_order_customization_aljamil/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
doctype_js = {
	"Sales Order": [
		"public/js/add_row.js",
		"public/js/approval_amount_limit.js",
		"public/js/available_percentage.js",
		"public/js/available_qty.js",
		"public/js/contract_discount.js",
		"public/js/deductible_amount.js",
		"public/js/delete_row.js",
		"public/js/discount2_1.js",
		"public/js/discount2_2.js",
		"public/js/discount2.js",
        "public/js/payment_entry.js",
		"public/js/discount_amount_emp2.js",
		"public/js/discount_amount.js",
		"public/js/discount_limit.js",
		"public/js/discount_percentage.js",
		"public/js/discount_percentage_so.js",
		"public/js/from_so_table_to_inv_table.js",
		"public/js/from_so_to_inv.js",
		"public/js/items_available.js",
		"public/js/mode_of_payment_account.js",
		"public/js/multi_add_button.js",
		"public/js/order_type.js",
		"public/js/outstanding.js",
		"public/js/payment_schedule.js",
		"public/js/projected_qty2.js",
		"public/js/request_for_quotation.js",
		"public/js/reservation.js",
		"public/js/reserved_qty.js",
		"public/js/sales_order2.js",
		"public/js/sales_order_3.js",
		"public/js/sales_order_insurance_data.js",
		"public/js/sales_order_script.js",
		"public/js/search_in_old_eye_examination.js",
		"public/js/sms2.js",
		"public/js/stock_entry.js",
		"public/js/stock_table_so.js",
		"public/js/tolal_items_discount.js",
		"public/js/total_deduction.js",
		"public/js/total_insurance.js",
		"public/js/total_price_list_rate.js",
	]
}

# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "sales_order_customization_aljamil/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "sales_order_customization_aljamil.utils.jinja_methods",
# 	"filters": "sales_order_customization_aljamil.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "sales_order_customization_aljamil.install.before_install"
# after_install = "sales_order_customization_aljamil.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "sales_order_customization_aljamil.uninstall.before_uninstall"
# after_uninstall = "sales_order_customization_aljamil.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "sales_order_customization_aljamil.utils.before_app_install"
# after_app_install = "sales_order_customization_aljamil.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "sales_order_customization_aljamil.utils.before_app_uninstall"
# after_app_uninstall = "sales_order_customization_aljamil.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "sales_order_customization_aljamil.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"sales_order_customization_aljamil.tasks.all"
# 	],
# 	"daily": [
# 		"sales_order_customization_aljamil.tasks.daily"
# 	],
# 	"hourly": [
# 		"sales_order_customization_aljamil.tasks.hourly"
# 	],
# 	"weekly": [
# 		"sales_order_customization_aljamil.tasks.weekly"
# 	],
# 	"monthly": [
# 		"sales_order_customization_aljamil.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "sales_order_customization_aljamil.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "sales_order_customization_aljamil.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "sales_order_customization_aljamil.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["sales_order_customization_aljamil.utils.before_request"]
# after_request = ["sales_order_customization_aljamil.utils.after_request"]

# Job Events
# ----------
# before_job = ["sales_order_customization_aljamil.utils.before_job"]
# after_job = ["sales_order_customization_aljamil.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"sales_order_customization_aljamil.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }


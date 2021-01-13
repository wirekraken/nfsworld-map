import json

team_info = None
area_info = None

def set_changes(control, area_id):
	# в pyanywhere указать абслолютный путь!
	with open ('static/team-info.json', 'r', encoding='utf-8') as file:
		team_info = json.load(file)

	with open ('static/area-info.json', 'r', encoding='utf-8') as file:
		area_info = json.load(file)

	for key in team_info:
		if area_id in team_info[key]['control_id']:
			team_info[key]['control_id'].remove(area_id) # находим район и удалям из списка
	team_info[control]['control_id'].append(area_id) # добвляем в выбранный

	for key in area_info:
		i = 0
		while i < len(area_info[key]):
			if area_info[key][i]['id'] == area_id: # находим команду владеющая районом
				area_info[key][i]['control'] = control # заменяем его новым
			i += 1
			
	with open ('static/team-info.json', 'w', encoding='utf-8') as file:
		json.dump(team_info, file, indent = 4)

	with open ('static/area-info.json', 'w', encoding='utf-8') as file:
		json.dump(area_info, file, indent = 4)

	return True

class Page {
	constructor() {
		this.buttons = {}
	}

	addButton(name, text, font, color, x, y, action, rectWidth=undefined, rectHeight=undefined, details=undefined) {
		this.buttons[name] = { text: text, font: font, color: color, left: x, top: y, details: details, action: action }
		if(rectWidth != undefined && rectHeight != undefined) {
			this.buttons[name].rectHeight = rectHeight
			this.buttons[name].rectWidth = rectWidth
		}
	}

	removeButton(name) {
		delete this.buttons[name]
	}

	drawButton(name) {
		let buttonProps = this.buttons[name]
		ctx.font = buttonProps.font
		ctx.fillStyle = buttonProps.color
		let height = parseInt(buttonProps.font)
		let width = ctx.measureText(buttonProps.text).width

		if (buttonProps.rectWidth != undefined && buttonProps.rectHeight != undefined) {
			ctx.fillText(buttonProps.text, buttonProps.left + buttonProps.rectWidth/2 - width/2, buttonProps.top + buttonProps.rectHeight/2 + height/3)
		} else {
			ctx.fillText(buttonProps.text, buttonProps.left, buttonProps.top)
		}

		if (buttonProps.rectWidth != undefined && buttonProps.rectHeight != undefined) {
			ctx.strokeStyle = "black"
			ctx.strokeRect(buttonProps.left, buttonProps.top, buttonProps.rectWidth, buttonProps.rectHeight)
		}
	}

	checkForPress(x, y) {
		for(var key in this.buttons) {
			let button = this.buttons[key]
			ctx.font = button.font
			let height = parseInt(button.font)
			let width = ctx.measureText(button.text).width

			if(button.rectWidth != undefined && button.rectHeight != undefined) {
				if(x > button.left && x < button.left + button.rectWidth
					&& y > button.top && y < button.top + button.rectHeight) {
					var item = key.split(" ").splice(1).join(" ")
					button.action(item)
				}
			} else {
				if(x > button.left && x < button.left + width
					&& y > button.top - height && y < button.top) {
					var item = key.split(" ").splice(1).join(" ")
					button.action(item)
				}
			}
		}
	}
}

var buildings = {
	"shed": {
		cost: {
			wood: 10
		},
		cooldown: 5
	},
	"range": {
		cost: {
			wood: 20,
			stone: 20
		},
		cooldown: 10
	},
	"farm": {
		cost: {
			seed: 15,
			wood: 15
		},
		cooldown: 15
	},
	"study": {
		cost: {
			wood: 100,
			stone: 100
		},
		cooldown: 20
	},
	"mine": {
		cost: {
			wood: 10,
			stone: 100
		}
	},
	"smithy": {
		cost: {
			iron: 10,
			stone: 100
		}
	}
}

goals_completed = 0
var goals = [{
	goal: "Build a shed",
	requirements: [ "10 wood" ],
	check: function() {
		if(chunk["shed"].length >= 1) {
			goals_completed += 1
		}
	}
}, {
	goal: "Build a range",
	requirements: [ "20 wood", "20 stone" ],
	check: function() {
		if(chunk["range"].length >= 1) {
			goals_completed += 1
		}
	}
}, {
	goal: "Gather and cook 20 fish",
	requirements: [ "20 fish" ],
	check: function() {
		let num_fish = 0
		if(inventory["cookedfish"]) {
			num_fish += inventory["cookedfish"]
		}
		for(i=0; i<chunk["shed"].length; i++) {
			if(chunk["shed"][i]["inventory"]["cookedfish"]) {
				num_fish += chunk["shed"][i]["inventory"]["cookedfish"]
			}
		}
		if(num_fish >= 20) {
			goals_completed += 1
		}
	}
}, {
	goal: "Build a farm",
	requirements: [ "15 seed", "15 wood" ],
	check: function() {
		if(chunk["farm"].length >= 1) {
			goals_completed += 1
		}
	}
}, {
	goal: "Build a mine",
	requirements: [ "10 wood", "100 stone" ],
	check: function() {
		if(chunk["mine"].length >= 1) {
			goals_completed += 1
		}
	}
}, {
	goal: "Build a smithy",
	requirements: [ "10 iron", "100 stone" ],
	check: function() {
		if(chunk["smithy"].length >= 1) {
			goals_completed += 1
		}
	}
}, {
	goal: "Build a study",
	requirements: [ "100 wood", "100 stone" ],
	check: function() {
		if(chunk["study"].length >= 1) {
			goals_completed += 1
		}
	}
}]

var chunk = {
	water: [],
	trees: [],
	plants: [],
	rocks: [],
	deer: [],
	shed: [],
	range: [],
	farm: [],
	study: [],
	mine: [],
	smithy: []
}

let markers = {
	"trees": { number: 20, cooldown: .25, health: 50 },
	"rocks": { number: 8, cooldown: .5 },
	"deer": { number: 8, cooldown: 1	},
	"plants": { number: 8, cooldown: .25, refresh: Date.now()/1000 + 2.5}
}
for(i in markers) {
	for(j = 0; j < markers[i].number; j++) {
		let x, y
		if(i == "trees" && chunk[i].length) {
			let roll = 1000*Math.random()
			if(roll > 500) {
				let closest_tree_dist = 100000
				while(closest_tree_dist == 100000 || closest_tree_dist < 15) {
					let roll2 = Math.floor((chunk[i].length - 1)*Math.random())
					x = chunk[i][roll2].x + 75 - 150*Math.random()
					y = chunk[i][roll2].y + 75 - 150*Math.random()

					for(k = 0; k < chunk["trees"].length; k++) {
						diffx = chunk["trees"][k].x - x
						diffy = chunk["trees"][k].y - y
						dist = Math.sqrt(diffx*diffx + diffy*diffy)

						if(closest_tree_dist == 100000 || dist < closest_tree_dist) {
							if(closest_tree_dist < 1) {
								closest_tree_dist = 100000
								break
							} else {
								closest_tree_dist = dist
							}
						}
					}
				}
			} else {
				x = 50 + 1200*Math.random()
				y = 50 + 1200*Math.random()
			}
		} else {
			x = 50 + 1200*Math.random()
			y = 50 + 1200*Math.random()
		}
		let obj = Object.assign({}, markers[i])
		delete obj["number"]
		obj.x = x
		obj.y = y
		chunk[i].push(obj)
	}
}

let momentum = 0
let bend = 0
let startx = 1200*Math.random()
for(y = 0; y < 1200; y = y + 14) {
	momentum += 5 - 10*Math.random()
	bend += momentum
	for(x = startx; x < startx + 50; x = x + 10) {
		chunk["water"].push({x: x + bend, y: y, cooldown: 2})
		for(i in markers) {
			let remove = []
			for(j=0; j<chunk[i].length; j++) {
				xdif = chunk[i][j].x - chunk["water"][chunk["water"].length - 1].x
				ydif = chunk[i][j].y - chunk["water"][chunk["water"].length - 1].y
				dist = Math.sqrt(xdif*xdif - ydif*ydif)
				if(dist < 25) {
					remove.push(j)
					continue
				}
			}
			remove.reverse()
			for(j=0; j<remove.length; j++) {
				chunk[i].splice(remove[j], 1)
			}
		}
	}
}

for(i=0; i<chunk["deer"].length; i++) {
	chunk["deer"][i].trajectory = Object.assign({}, {
		angle: 2*Math.PI*Math.random(),
		turning: 0
	})
}

var hero = {
	x: 300,
	y: 300,
	targetx: undefined,
	targety: undefined,
	cooldown: Date.now()/1000
}
var inventory = {}

var buttonsLoaded = false
var home = new Page()
var inv = new Page()
var currentPage = "home"
var callStack = 0

var pages = {
  home: home,
	inv: inv
}

var pageLoadChecker = {
	home: false,
	inv: false
}

var commands = []
var progress = 0
var retrieve_progress = 0
var building_progress = {}
var gathering_notifications = []
var hunger = 0
var health = 100
var inMine = false
var gettingFood = false

function logError(message) {
	document.getElementById("history-text").innerText += "\n" + message
	throw(Error(message))
}

function parseScript() {
	var script = document.getElementById("input-box").value
	document.getElementById("input-box").value = ""
	script = script.split(/\n/).join("\n>> ")
	document.getElementById("history-text").innerText += "\n>> " + script
	var commandPhrases = script.split(/\n>> /)
	for(i=0; i<commandPhrases.length; i++) {
		let phrase = commandPhrases[i].split(" ")
		if(phrase[0] && phrase[1] && phrase[2]) {
			callStack += 1
			commands.push({verb: phrase[0], number: phrase[1], noun: phrase[2], details: phrase[3], finished: false})
		} else if(phrase[0].toUpperCase() == "STOP") {
			progress = 0
			callStack = 0
			commands = []
		}
	}
}

function drawHero() {
	ctx.font = "16px Arial"
	ctx.fillStyle = "red"

	if(!inMine) {
		ctx.fillText("H", 300, 300)
	}
}

function drawChunk() {
	for(i=0; i<chunk["water"].length; i++) {
		ctx.font = "16px Arial"
		ctx.fillStyle = "blue"
		ctx.fillText("S", chunk["water"][i].x - (hero.x - 300), chunk["water"][i].y - (hero.y - 300))
	}
	for(i=0; i<chunk["trees"].length; i++) {
		ctx.font = "16px Arial"
		ctx.fillStyle = "green"
		ctx.fillText("T", chunk["trees"][i].x - (hero.x - 300), chunk["trees"][i].y - (hero.y - 300))
	}
	for(i=0; i<chunk["rocks"].length; i++) {
		ctx.font = "16px Arial"
		ctx.fillStyle = "grey"
		ctx.fillText("O", chunk["rocks"][i].x - (hero.x - 300), chunk["rocks"][i].y - (hero.y - 300))
	}
	for(i=0; i<chunk["deer"].length; i++) {
		ctx.font = "16px Arial"
		ctx.fillStyle = "brown"
		ctx.fillText("D", chunk["deer"][i].x - (hero.x - 300), chunk["deer"][i].y - (hero.y - 300))
	}
	for(i=0; i<chunk["shed"].length; i++) {
		ctx.font = "16px Arial"
		ctx.fillStyle = "black"
		ctx.fillText("_____", chunk["shed"][i].x - (hero.x - 300), chunk["shed"][i].y - (hero.y - 300))
		ctx.fillText("|        |", chunk["shed"][i].x - (hero.x - 300), chunk["shed"][i].y - (hero.y - 300) + 16)
		ctx.fillText("|        |", chunk["shed"][i].x - (hero.x - 300), chunk["shed"][i].y - (hero.y - 300) + 32)
	}
	for(i=0; i<chunk["range"].length; i++) {
		ctx.font = "16px Arial"
		ctx.fillStyle = "black"
		ctx.fillText("||", chunk["range"][i].x - (hero.x - 300), chunk["range"][i].y - (hero.y - 300) + 16)
		ctx.fillText("_____", chunk["range"][i].x - (hero.x - 300), chunk["range"][i].y - (hero.y - 300) + 16)
		ctx.fillText("|        |", chunk["range"][i].x - (hero.x - 300), chunk["range"][i].y - (hero.y - 300) + 32)
	}
	for(i=0; i<chunk["farm"].length; i++) {
		ctx.font = "16px Arial"
		ctx.fillStyle = "black"
		let keys = Object.keys(chunk["farm"][i].inventory)
		if(keys.length && keys.includes("seed") && chunk["farm"][i]["inventory"].seed > 0) {
			ctx.fillText("o--------------o", chunk["farm"][i].x - (hero.x - 300), chunk["farm"][i].y - (hero.y - 300) - 32)
			ctx.fillText("| . . . . . . . . . |", chunk["farm"][i].x - (hero.x - 300), chunk["farm"][i].y - (hero.y - 300) - 16)
			ctx.fillText("| . . . . . . . . . |", chunk["farm"][i].x - (hero.x - 300), chunk["farm"][i].y - (hero.y - 300))
			ctx.fillText("| . . . . . . . . . |", chunk["farm"][i].x - (hero.x - 300), chunk["farm"][i].y - (hero.y - 300) + 16)
			ctx.fillText("o--------------o", chunk["farm"][i].x - (hero.x - 300), chunk["farm"][i].y - (hero.y - 300) + 32)
		} else if(keys.length) {
			let has_vegetables = false
			for(j=0; j<keys.length; j++) {
				if(keys[j] != "seed" && chunk["farm"][i]["inventory"][keys[j]] > 0) {
					ctx.fillText("o--------------o", chunk["farm"][i].x - (hero.x - 300), chunk["farm"][i].y - (hero.y - 300) - 32)
					ctx.fillText("| Y Y Y Y Y |", chunk["farm"][i].x - (hero.x - 300), chunk["farm"][i].y - (hero.y - 300) - 16)
					ctx.fillText("| Y Y Y Y Y |", chunk["farm"][i].x - (hero.x - 300), chunk["farm"][i].y - (hero.y - 300))
					ctx.fillText("| Y Y Y Y Y |", chunk["farm"][i].x - (hero.x - 300), chunk["farm"][i].y - (hero.y - 300) + 16)
					ctx.fillText("o--------------o", chunk["farm"][i].x - (hero.x - 300), chunk["farm"][i].y - (hero.y - 300) + 32)
				} else {
					ctx.fillText("o--------------o", chunk["farm"][i].x - (hero.x - 300), chunk["farm"][i].y - (hero.y - 300) - 32)
					ctx.fillText("| _ _ _ _ _ _ |", chunk["farm"][i].x - (hero.x - 300), chunk["farm"][i].y - (hero.y - 300) - 16)
					ctx.fillText("| _ _ _ _ _ _ |", chunk["farm"][i].x - (hero.x - 300), chunk["farm"][i].y - (hero.y - 300))
					ctx.fillText("| _ _ _ _ _ _ |", chunk["farm"][i].x - (hero.x - 300), chunk["farm"][i].y - (hero.y - 300) + 16)
					ctx.fillText("o--------------o", chunk["farm"][i].x - (hero.x - 300), chunk["farm"][i].y - (hero.y - 300) + 32)
				}
			}
		} else {
			ctx.fillText("o--------------o", chunk["farm"][i].x - (hero.x - 300), chunk["farm"][i].y - (hero.y - 300) - 32)
			ctx.fillText("| _ _ _ _ _ _ |", chunk["farm"][i].x - (hero.x - 300), chunk["farm"][i].y - (hero.y - 300) - 16)
			ctx.fillText("| _ _ _ _ _ _ |", chunk["farm"][i].x - (hero.x - 300), chunk["farm"][i].y - (hero.y - 300))
			ctx.fillText("| _ _ _ _ _ _ |", chunk["farm"][i].x - (hero.x - 300), chunk["farm"][i].y - (hero.y - 300) + 16)
			ctx.fillText("o--------------o", chunk["farm"][i].x - (hero.x - 300), chunk["farm"][i].y - (hero.y - 300) + 32)
		}
	}
	for(i=0; i<chunk["study"].length; i++) {
		ctx.font = "16px Arial"
		ctx.fillStyle = "black"
		ctx.fillText("  __  ", chunk["study"][i].x - 6 - (hero.x - 300), chunk["study"][i].y - 24 - (hero.y - 300))
		ctx.fillText("_/ _ \\_", chunk["study"][i].x - 10 - (hero.x - 300), chunk["study"][i].y - 8 - (hero.y - 300))
		ctx.fillText("|| || ||", chunk["study"][i].x - 5 - (hero.x - 300), chunk["study"][i].y + 8 - (hero.y - 300))
	}
	for(i=0; i<chunk["mine"].length; i++) {
		ctx.font = "16px Arial"
		ctx.fillStyle = "black"
		ctx.fillText("  __  ", chunk["mine"][i].x - 3 - (hero.x - 300), chunk["mine"][i].y - 24 - (hero.y - 300))
		ctx.fillText("/ H \\", chunk["mine"][i].x - (hero.x - 300), chunk["mine"][i].y - 8 - (hero.y - 300))
		ctx.fillText("   H   ", chunk["mine"][i].x - 4.4 - (hero.x - 300), chunk["mine"][i].y - (hero.y - 300))
		ctx.fillText("\\___/", chunk["mine"][i].x - 2 - (hero.x - 300), chunk["mine"][i].y + 8 - (hero.y - 300))
	}
	for(i=0; i<chunk["smithy"].length; i++) {
		ctx.font = "16px Arial"
		ctx.fillStyle = "black"
		ctx.fillText("______", chunk["smithy"][i].x + 2 - (hero.x - 300), chunk["smithy"][i].y - 14 - (hero.y - 300))
		ctx.fillText("|_    __/", chunk["smithy"][i].x - (hero.x - 300), chunk["smithy"][i].y - (hero.y - 300))
		ctx.fillText("  )__(", chunk["smithy"][i].x - (hero.x - 300), chunk["smithy"][i].y + 14 - (hero.y - 300))
	}
	for(i in building_progress) {
		ctx.font = "16px Arial"
		ctx.fillStyle = "black"
		ctx.fillText("XXX", building_progress[i].x - (hero.x - 300), building_progress[i].y - (hero.y - 300))
	}
}

function drawHome() {
	if(!pageLoadChecker.home) {
		home.addButton("inventory", "Inventory", "14px Arial", "black", 10, 30, function() {
			currentPage = "inv"
			pageLoadChecker.home = false
		})
	}
	home.drawButton("inventory")
	ctx.strokeStyle = "black"
	ctx.strokeRect(10, 50, 15, 100)
	ctx.fillStyle = "red"
	ctx.fillRect(11, 51 + (100 - health), 13, 98*health/100)

	ctx.strokeStyle = "black"
	ctx.strokeRect(35, 50, 15, 100)
	ctx.fillStyle = "darkgreen"
	ctx.fillRect(36, 51 + hunger, 13, 98*(100 - hunger)/100)

	if(goals[goals_completed]) {
		let width = ctx.measureText(goals[goals_completed].goal).width
		ctx.fillStyle = "white"
		ctx.globalAlpha = .9
		ctx.fillRect(480 - width, 10, 110 + width, 45 + 15*(goals[goals_completed].requirements.length - 1))
		ctx.font = "14px Arial"
		ctx.fillStyle = "black"
		ctx.strokeRect(480 - width, 10, 110 + width, 45 + 15*(goals[goals_completed].requirements.length - 1))
		ctx.globalAlpha = 1
		ctx.fillText("Goal: " + goals[goals_completed].goal, 500 - width, 30)
		ctx.fillText("Requirements: ", 500 - width, 45)
		let width2 = ctx.measureText("Requirements: ").width
		for(i=0; i<goals[goals_completed].requirements.length; i++) {
			ctx.fillText(goals[goals_completed].requirements[i], 500 - width + width2, 45 + 15*i)
		}
	}

	pageLoadChecker.home = true
}

function drawInventory() {
	if(!pageLoadChecker.inv) {
		ctx.clearRect(0, 0, 600, 600)
		inv.addButton("close", "Close Inventory", "14px Arial", "black", 10, 30, function() {
			currentPage = "home"
			pageLoadChecker.inv = false
		})
		inv.drawButton("close")

		ctx.font = "14px Arial"
		ctx.fillStyle = "black"
		let keys = Object.keys(inventory)
		let size = keys.length
		for(i in inventory) {
			j = keys.indexOf(i)
			ctx.fillText(i + ": " + inventory[i], 10, 50 + 15*j)
		}

		let store = {}
		let count = 0
		for(i=0; i<chunk["shed"].length; i++) {
			keys = Object.keys(chunk["shed"][i]["inventory"])
			for(j=0; j<keys.length; j++) {
				store[keys[j]] = store[keys[j]] ? store[keys[j]] + chunk["shed"][i]["inventory"][keys[j]] : chunk["shed"][i]["inventory"][keys[j]]
				count += chunk["shed"][i]["inventory"][keys[j]]
			}
		}
		ctx.fillText("Stored: " + count + "/" + (chunk["shed"].length*100), 10, 70 + 15*size)
		keys = Object.keys(store)
		for(i=0; i<keys.length; i++) {
			ctx.fillText(keys[i] + ": " + store[keys[i]], 10, 85 + 15*size + 15*i)
		}
	}
	pageLoadChecker.inventory = true
}

function createCanvas() {
	if(currentPage == "inv") {
		drawInventory()
	} else {
		ctx.clearRect(0, 0, 600, 600)
		drawChunk()
		drawHero()
		drawHome()
	}
}

var actions = {
	gather: function(num, item) {
		num = parseInt(num)
		let source
		let item_tags = {"wood": "trees", "stone": "rocks", "fish": "water", "seed": "plants"}
		for(key in item_tags) {
			if(key == item) {
				source = item_tags[key]
			}
		}

		if (progress == num){
			commands[0].finished = true
			progress = 0
			return
	 	}

		num_items = 0
		for(i in inventory) {
			num_items += inventory[i]
		}
		if(num_items < 10) {
			let closest_dist = 100000
			let closest_source = 0
			for(i=0; i<chunk[source].length; i++) {
				xdif = chunk[source][i].x - hero.x
				ydif = chunk[source][i].y - hero.y
				dist = Math.sqrt(xdif*xdif + ydif*ydif)

				if(dist < closest_dist) {
					closest_dist = dist
					closest_source = i
				}
			}

			if(closest_dist > 25) {
				xdif = chunk[source][closest_source].x - hero.x
				ydif = chunk[source][closest_source].y - hero.y
				closest_dist = Math.sqrt(xdif*xdif + ydif*ydif)
				angle = Math.atan2(ydif, xdif)
				movex = 5*Math.cos(angle)
				movey = 5*Math.sin(angle)
				hero.x += movex
				hero.y += movey
			} else if (progress < num) {
				if(Date.now()/1000 > hero.cooldown) {
					hero.cooldown = Date.now()/1000 + chunk[source][closest_source].cooldown
					inventory[item] = inventory[item] ? inventory[item] + 1 : 1
					if(chunk[source][closest_source].health) {
						chunk[source][closest_source].health -= 1
						if(chunk[source][closest_source].health <= 0) {
							chunk[source].splice(closest_source, 1)
						}
					}
					gathering_notifications.push({message: "+1 " + item, timeout: Date.now()/1000 + 1, x: hero.x, y: hero.y - 10})
					progress += 1
				}
			}
		} else {
			for(i in inventory) {
				if(inventory[i]) {
					commands.splice(0, 0, {verb: "store", number: inventory[i], noun: i, finished: false})
					callStack += 1
				}
			}
		}
	},
	build: function(num, item) {
		num = parseInt(num)
		let isolated = true
		let movex = 0, movey = 0

		if(progress == num) {
			commands[0].finished = true
			progress = 0
			return
		}

		if(!building_progress[item]) {
			for(i in chunk) {
				let total_in_range = 0
				for(j=0; j<chunk[i].length; j++) {
					xdif = chunk[i][j].x - hero.x
					ydif = chunk[i][j].y - hero.y
					dist = Math.sqrt(xdif*xdif + ydif*ydif)

					if(dist <= 100) {
						total_in_range += 1
					}
				}
				if(total_in_range) {
					for(j=0; j<chunk[i].length; j++) {
						xdif = chunk[i][j].x - hero.x
						ydif = chunk[i][j].y - hero.y
						dist = Math.sqrt(xdif*xdif + ydif*ydif)

						if(dist <= 100) {
							isolated = false
							if(hero.targetx == undefined && hero.targety == undefined) {
								hero.targetx = hero.x
								hero.targety = hero.y
								angle = Math.atan2(ydif, xdif)
								angle += (Math.PI/8) + (Math.PI/4) * Math.random()
								hero.targetx -= 100*Math.cos(angle)/total_in_range
								hero.targety -= 100*Math.sin(angle)/total_in_range
							}
						}
					}
				}
			}
			if(isolated) {
				building_progress[item] = { x: hero.x, y: hero.y, inventory: {} }
				hero.targetx = undefined
				hero.targety = undefined
			}
		}

		if(building_progress[item]) {
			diffx = building_progress[item].x - hero.x
			diffy = building_progress[item].y - hero.y
			dist = Math.sqrt(diffx*diffx + diffy*diffy)
			if(dist > 15) {
				angle = Math.atan2(diffy, diffx)
				hero.x += 5*Math.cos(angle)
				hero.y += 5*Math.sin(angle)
			} else {
				let owned_mat = false
				let cost_keys = Object.keys(buildings[item]["cost"])
				let inv_keys = Object.keys(inventory)
				for(i=0; i<cost_keys.length; i++) {
					let check_item = cost_keys[i]
					if(!building_progress[item][check_item]) {
						building_progress[item][check_item] = 0
					}
					if(building_progress[item][check_item] < buildings[item]["cost"][check_item]) {
						if(inv_keys.includes(check_item) && inventory[check_item] > 0) {
							owned_mat = cost_keys[i]
						}
					}
				}

				if(!owned_mat) {
					let needed_mats = []
					let cost_keys = Object.keys(buildings[item]["cost"])
					for(i=0; i<cost_keys.length; i++) {
						let check_item = cost_keys[i]
						if(!building_progress[item][check_item]) {
							building_progress[item][check_item] = 0
						}
						if(building_progress[item][check_item] < buildings[item]["cost"][check_item]) {
							needed_mats.push(cost_keys[i])
						}
					}

					let free_space = 10
					for(j in inventory) {
						free_space -= inventory[j]
					}
					for(i = 0; i<needed_mats.length; i++) {
						let num_item = 0
						for(j = 0; j < chunk["shed"].length; j++) {
							if(chunk["shed"][j]["inventory"][needed_mats[i]]) {
								num_item += chunk["shed"][j]["inventory"][needed_mats[i]]
							}
						}
						if(num_item == 0) {
							logError("Not enough " + needed_mats[i] + " to build " + item)
							if(i == needed_mats.length - 1) {
								commands[0].finished = true
							}
						} else {
							let needed = buildings[item]["cost"][needed_mats[i]] - building_progress[item][needed_mats[i]]
							if(needed <= num_item) {
								if(needed > free_space) {
									commands.splice(0, 0, {verb: "retrieve", number: free_space, noun: needed_mats[i], finished: false})
									callStack += 1
									if(free_space == 0) {
										for(j in inventory) {
											if(inventory[j] > 0) {
												commands.splice(0, 0, {verb: "store", number: inventory[j], noun: j, finished: false})
												callStack += 1
											}
										}
									} else {
										free_space = 0
									}
								} else {
									commands.splice(0, 0, {verb: "retrieve", number: needed, noun: needed_mats[i], finished: false})
									free_space -= needed
									callStack += 1
								}
							} else {
								if(num_item > free_space) {
									commands.splice(0, 0, {verb: "retrieve", number: free_space, noun: needed_mats[i], finished: false})
									callStack += 1
									if(free_space == 0) {
										for(j in inventory) {
											if(inventory[j] > 0) {
												commands.splice(0, 0, {verb: "store", number: inventory[j], noun: j, finished: false})
												callStack += 1
											}
										}
									} else {
										free_space = 0
									}
								} else {
									commands.splice(0, 0, {verb: "retrieve", number: num_item, noun: needed_mats[i], finished: false})
									free_space -= num_item
									callStack += 1
								}
							}
						}
					}
				} else {
					building_progress[item][owned_mat] += inventory[owned_mat]
					inventory[owned_mat] = 0
				}
				let all_paid = true
				for(j in buildings[item]["cost"]) {
					if(building_progress[item][j] != buildings[item]["cost"][j]) {
						all_paid = false
					}
				}
				if(all_paid) {
					for(j in buildings[item]["cost"]) {
						delete building_progress[item][j]
					}
					chunk[item].push(building_progress[item])
					delete building_progress[item]
					progress += 1
				}
			}
		}
	},
	retrieve: function(num, item, source) {
		num = parseInt(num)
		let applicable_buildings = {}
		if(hero.targetx && hero.targety) {
			hero.targetx = undefined
			hero.targety = undefined
		}
		if(retrieve_progress >= num) {
			commands[0].finished = true
			retrieve_progress = 0
			return
		}
		if(source) {
			for(j = 0; j < chunk[source].length; j++) {
				if(chunk[source][j]["inventory"] && chunk[source][j]["inventory"][item]) {
					if(!applicable_buildings[source]) {
						applicable_buildings[source] = [j]
					} else {
						applicable_buildings.push(j)
					}
				}
			}
		} else {
			for(i in chunk) {
				for(j = 0; j < chunk[i].length; j++) {
					if(chunk[i][j]["inventory"] && chunk[i][j]["inventory"][item]) {
						if(!applicable_buildings[i]) {
							applicable_buildings[i] = [j]
						} else {
							applicable_buildings[i].push(j)
						}
					}
				}
			}
		}
		let closest_dist = 100000
		let closest_building_type = ""
		let closest_building = 0
		for(i in applicable_buildings) {
			for(j = 0; j < applicable_buildings[i].length; j++) {
				xdif = chunk[i][applicable_buildings[i][j]].x - hero.x
				ydif = chunk[i][applicable_buildings[i][j]].y - hero.y
				dist = Math.sqrt(xdif*xdif + ydif*ydif)

				if(dist < closest_dist) {
					closest_dist = dist
					closest_building_type = i
					closest_building = j
				}
			}
		}
		if(closest_dist == 100000) {
			commands[0].finished = true
			logError(item + " is not in any building")
			return
		}

		if(closest_dist > 25) {
			xdif = chunk[closest_building_type][applicable_buildings[closest_building_type][closest_building]].x - hero.x
			ydif = chunk[closest_building_type][applicable_buildings[closest_building_type][closest_building]].y - hero.y
			closest_dist = Math.sqrt(xdif*xdif + ydif*ydif)
			angle = Math.atan2(ydif, xdif)
			hero.x += 5*Math.cos(angle)
			hero.y += 5*Math.sin(angle)
		} else {
			let space = 10
			for(i in inventory) {
				space -= inventory[i]
			}

			let amt_in_building = chunk[closest_building_type][applicable_buildings[closest_building_type][closest_building]]["inventory"][item]
			if(num - retrieve_progress <= space) {
				if(amt_in_building < num - retrieve_progress) {
					chunk[closest_building_type][applicable_buildings[closest_building_type][closest_building]]["inventory"][item] = 0
					inventory[item] += amt_in_building
					retrieve_progress += amt_in_building
				} else {
					chunk[closest_building_type][applicable_buildings[closest_building_type][closest_building]]["inventory"][item] -= num
					inventory[item] = inventory[item] ? inventory[item] + num - retrieve_progress: num - retrieve_progress
					retrieve_progress += num - retrieve_progress
				}
			} else {
				if(amt_in_building < space) {
					chunk[closest_building_type][applicable_buildings[closest_building_type][closest_building]]["inventory"][item] = 0
					inventory[item] += amt_in_building
					retrieve_progress += amt_in_building
				} else {
					chunk[closest_building_type][applicable_buildings[closest_building_type][closest_building]]["inventory"][item] -= space
					inventory[item] += space
					retrieve_progress += space
					logError("Not enough inventory space for " + num + " " + item)
				}
			}
		}
	},
	store: function(num, item) {
		num = parseInt(num)
		if(inventory[item] <= 0) {
			logError("You have " + inventory[item] + " " + item)
			progress = 0
			commands[0].finished = true
			return
		}
		if(chunk["shed"].length == 0) {
			logError("You have no sheds")
			progress = 0
			commands[0].finished = true
			return
		}
		if(hero.targetx && hero.targety) {
			hero.targetx = undefined
			hero.targety = undefined
		}
		let closest_dist = 100000
		let closest_shed = 0
		for(i=0; i<chunk["shed"].length; i++) {
			let num_items = 0
			for(j in chunk["shed"][i]["inventory"]) {
				num_items += chunk["shed"][i]["inventory"][j]
			}
			if(num_items < 100) {
				xdif = chunk["shed"][i].x - hero.x
				ydif = chunk["shed"][i].y - hero.y
				dist = Math.sqrt(xdif*xdif + ydif*ydif)

				if(dist < closest_dist) {
					closest_dist = dist
					closest_shed = i
				}
			}
		}
		if(closest_dist == 100000) {
			commands[0].finished = true
			progress = 0
			logError("All sheds are full")
			return
		}

		if(closest_dist > 25) {
			xdif = chunk["shed"][closest_shed].x - hero.x
			ydif = chunk["shed"][closest_shed].y - hero.y
			closest_dist = Math.sqrt(xdif*xdif + ydif*ydif)
			angle = Math.atan2(ydif, xdif)
			movex = 5*Math.cos(angle)
			movey = 5*Math.sin(angle)
			hero.x += movex
			hero.y += movey
		} else {
			let num_items = 0
			for(i in chunk["shed"][closest_shed]["inventory"]) {
				num_items += chunk["shed"][closest_shed]["inventory"][i]
			}
			if(inventory[item] < num) {
				commands[0].finished = true
				commands.splice(0, 0, {verb: "store", number: inventory[item], noun: item, finished: false})
				callStack += 1
			} else {
				if(num_items < 100) {
					if(num + chunk["shed"][closest_shed]["inventory"][item] > 100) {
						let space_available = 100 - chunk["shed"][closest_shed]["inventory"][item]
						chunk["shed"][closest_shed]["inventory"][item] = 100
						inventory[item] -= space_available
						commands.splice(0, 0, {verb: "store", number: (num - space_available), noun: item, finished: false})
						callStack += 1
					} else {
						let stored = chunk["shed"][closest_shed]["inventory"][item]
						chunk["shed"][closest_shed]["inventory"][item] = stored ? stored + num : num
						inventory[item] -= num
						commands[0].finished = true
					}
				}
			}
		}
	},
	drop: function(num, item) {
		num = parseInt(num)
		if(inventory[item] <= 0) {
			commands[0].finished = true
			logError("You aren't holding any " + item)
		}
		if(inventory[item] >= num) {
			inventory[item] -= num
			commands[0].finished = true
			return
		} else {
			inventory[item] = 0
			commands[0].finished = true
			return
		}
	},
	cook: function(num, item) {
		num = parseInt(num)
		let cookables = ["fish"]
		if(!cookables.includes(item)) {
			progress = 0
			logError("Cannot cook " + item)
			return
		}
		if(progress == num) {
			commands[0].finished = true
			progress = 0
			return
		}

		if(progress < num) {
			if(!chunk["range"].length) {
				logError("Cannot cook " + item + ": No ranges")
				commands[0].finished = true
				return
			}
			let keys = Object.keys(inventory)
			if(keys.includes(item) && inventory[item] > 0) {
				closest_dist = 100000
				closest_range = 0
				for(i=0; i<chunk["range"].length; i++) {
					xdiff = chunk["range"][i].x - hero.x
					ydiff = chunk["range"][i].y - hero.y
					dist = Math.sqrt(xdiff*xdiff + ydiff*ydiff)
					if(dist < closest_dist) {
						closest_dist = dist
						closest_range = i
					}
				}
				if(closest_dist > 15) {
					angle = Math.atan2(ydiff, xdiff)
					movex = 5*Math.cos(angle)
					movey = 5*Math.sin(angle)
					hero.x += movex
					hero.y += movey
				} else {
					if(Date.now()/1000 > hero.cooldown) {
						hero.cooldown = Date.now()/1000 + .5
						inventory[item] -= 1
						inventory["cooked" + item] = inventory["cooked" + item] ? inventory["cooked" + item] + 1 : 1
						gathering_notifications.push({message: "+1 " + "cooked" + item, timeout: Date.now()/1000 + 1, x: hero.x, y: hero.y - 10})
						progress += 1
					}
				}
			} else {
				let space = 10
				for(i in inventory) {
					space -= inventory[i]
				}
				if(space == 0) {
					commands.splice(0, 0, {verb: "store", number: inventory["cooked" + item], noun: "cooked" + item, finished: false})
					callStack += 1
				} else {
					if(space < num - progress) {
						commands.splice(0, 0, {verb: "retrieve", number: space, noun: item, finished: false})
						callStack += 1
					} else {
						commands.splice(0, 0, {verb: "retrieve", number: num - progress, noun: item, finished: false})
						callStack += 1
					}
				}
			}
		}
	},
	plant: function(num, item) {
		num = parseInt(num)
		let plantables = ["seed"]
		if(!plantables.includes(item)) {
			logError("Cannot plant " + item)
			commands[0].finished = true
			return
		}

		if(progress < num) {
			let keys = Object.keys(inventory)
			if(keys.includes(item) && inventory[item] > 0) {
				closest_dist = 100000
				closest_range = 0
				for(i=0; i<chunk["farm"].length; i++) {
					xdiff = chunk["farm"][i].x - hero.x
					ydiff = chunk["farm"][i].y - hero.y
					dist = Math.sqrt(xdiff*xdiff + ydiff*ydiff)
					if(dist < closest_dist) {
						closest_dist = dist
						closest_farm = i
					}
				}
				if(closest_dist > 15) {
					angle = Math.atan2(ydiff, xdiff)
					movex = 5*Math.cos(angle)
					movey = 5*Math.sin(angle)
					hero.x += movex
					hero.y += movey
				} else {
					if(num - progress <= inventory[item]) {
						if(!chunk["farm"][closest_farm]["inventory"][item]) {
							chunk["farm"][closest_farm]["inventory"][item] = 0
						}
						chunk["farm"][closest_farm]["inventory"][item] += num - progress
						inventory[item] -= num - progress
						progress += num - progress
						chunk["farm"][closest_farm].cooldown = Date.now()/1000 + 10
					} else {
						if(!chunk["farm"][closest_farm]["inventory"][item]) {
							chunk["farm"][closest_farm]["inventory"][item] = 0
						}
						chunk["farm"][closest_farm]["inventory"][item] += inventory[item]
						progress += inventory[item]
						inventory[item] = 0
						chunk["farm"][closest_farm].cooldown = Date.now()/1000 + 10
					}
				}
			} else {
				let space = 10
				for(i in inventory) {
					space -= inventory[i]
				}

				commands.splice(0, 0, {verb: "retrieve", number: space, noun: item, details: "shed", finished: false})
				callStack += 1
			}
		} else {
			commands[0].finished = true
			progress = 0
			return
		}
	},
	research: function(num, item) {
		num = parseInt(num)
		if(!chunk["study"].length) {
			logError("You have no studys")
			commands[0].finished = true
			return
		}
		researchables = ["weapon", "armor", "technology"]
		if(!researchables.includes(item)) {
			logError("Cannot research " + item)
			commands[0].finished = true
			return
		}
	},
	mine: function(num, item) {
		num = parseInt(num)
		if(!chunk["mine"].length) {
			logError("You have no mines")
			commands[0].finished = true
			return
		}
		if(item != "stone") {
			logError("You cannot mine " + item)
			commands[0].finished = true
			return
		}

		if(progress >= num) {
			commands[0].finished = true
			progress = 0
			return
		}

		let closest_dist = 100000
		let closest_mine = 0
		for(i=0; i<chunk["mine"].length; i++) {
			xdif = chunk["mine"][i].x - hero.x
			ydif = chunk["mine"][i].y - hero.y
			dist = Math.sqrt(xdif*xdif + ydif*ydif)

			if(dist < closest_dist) {
				closest_dist = dist
				closest_mine = i
			}
		}
		if(closest_dist == 100000) {
			logError("You have no mines")
			commands[0].finished = true
			return
		}
		if(closest_dist > 15 && !inMine) {
			xdif = chunk["mine"][closest_mine].x - hero.x
			ydif = chunk["mine"][closest_mine].y - hero.y
			angle = Math.atan2(ydif, xdif)
			hero.x += 5*Math.cos(angle)
			hero.y += 5*Math.sin(angle)
		} else {
			inMine = true
			let free_space = 10
			let metals = []
			for(j in inventory) {
				free_space -= inventory[j]
				if((j == "copper" || j == "iron") && inventory[j] > 0) {
					metals.push(j)
				}
			}
			if(free_space <= 0) {
				for(j = 0; j < metals.length; j++) {
					commands.splice(0, 0, {verb: "store", number: inventory[metals[j]], noun: metals[j]})
					callStack += 1
				}
			} else {
				if(Date.now()/1000 > hero.cooldown) {
					hero.cooldown = Date.now()/1000 + 5
					progress += 1
					let roll = 1000*Math.random()
					if(roll < 100) {
						inventory["iron"] = inventory["iron"] ? inventory["iron"] + 1 : 1
						gathering_notifications.push({message: "+1 iron", timeout: Date.now()/1000 + 1, x: chunk["mine"][closest_mine].x, y: chunk["mine"][closest_mine].y - 10})
					} else if(roll < 500) {
						inventory["copper"] = inventory["copper"] ? inventory["copper"] + 1 : 1
						gathering_notifications.push({message: "+1 copper", timeout: Date.now()/1000 + 1, x: chunk["mine"][closest_mine].x, y: chunk["mine"][closest_mine].y - 10})
					}
				}
			}
		}
	},
	smith: function(num, type, item) {
		num = parseInt(num)
		types = ["copper", "iron", "steel"]
		items = ["weapon", "armor"]
		if(!types.includes(type)) {
			logError(type + " is not copper, iron, or steel")
			commands[0].finished = true
			return
		}
		if(!items.includes(item)) {
			logError(item + " is not weapon or armor")
			commands[0].finished = true
			return
		}

		closest_dist = 100000
		closest_smithy = 0
		for(i=0; i<chunk["smithy"].length; i++) {
			xdif = chunk["smithy"][i].x - hero.x
			ydif = chunk["smithy"][i].y - hero.y
			dist = Math.sqrt(xdif*xdif + ydif*ydif)

			if(dist < closest_dist) {
				closest_smithy = i
				closest_dist = dist
			}
		}
		if(closest_dist == 100000) {
			logError("You have no smithys")
			commands[0].finished = true
			return
		}
		if(closest_dist > 25) {
			xdif = chunk["smithy"][closest_smithy].x - hero.x
			ydif = chunk["smithy"][closest_smithy].y - hero.y
			angle = Math.atan2(ydif, xdif)
			hero.x += 5*Math.cos(angle)
			hero.y += 5*Math.sin(angle)
		} else {
			if(Date.now()/1000 > hero.cooldown()) {
				let free_space = 10
				let dump = ""
				for(j in inventory) {
					if(inventory[j] > 0) {
						dump = j
					}
					free_space -= inventory[j]
				}
				if(free_space) {
					inventory[type + item] = inventory[type + item] ? inventory[type + item] + 1 : 1
				} else if(inventory[type + item] && inventory[type + item] > 0) {
					commands.splice(0, 0, {verb: "store", number: inventory[type + item], noun: type + item, finished: false})
					callStack += 1
				} else {
					commands.splice(0, 0, {verb: "store", number: 1, noun: type + item, finished: false})
					commands.splice(0, 0, {verb: "drop", number: 1, noun: dump, finished: false})
					callStack += 2
				}
			}
		}

	}
}

function executeCommands(verb, number, noun, details) {
	actions[verb](number, noun, details)
}

function update() {
	inMine = false
	hunger += .002
	if(hunger > 50) {
		let food
		let keys = Object.keys(inventory)
		for(i=0; i<keys.length; i++) {
			if((keys[i].includes("cooked") || keys[i].includes("vegetables")) && inventory[keys[i]] > 0) {
				food = keys[i]
			}
		}
		if(!food && !gettingFood) {
			for(i=0; i<chunk["shed"].length; i++) {
				keys = Object.keys(chunk["shed"][i]["inventory"])
				for(j=0; j<keys.length; j++) {
					if((keys[j].includes("cooked") || keys[j].includes("vegetables")) && chunk["shed"][i]["inventory"][keys[j]] > 0) {
						let free_space = 10
						let dump = ""
						for(k in inventory) {
							if(inventory[k] > 0) {
								dump = k
							}
							free_space -= inventory[k]
						}
						if(free_space >= 1) {
							gettingFood = true
							commands.splice(0, 0, {verb: "retrieve", number: 1, noun: keys[j], finished: false})
							callStack += 1
						} else {
							gettingFood = true
							commands.splice(0, 0, {verb: "retrieve", number: 1, noun: keys[j], finished: false})
							commands.splice(0, 0, {verb: "drop", number: 1, noun: dump, finished: false})
							callStack += 2
						}
					}
				}
			}
		}
		if(food) {
			gettingFood = false
			hunger = 0
			inventory[food] -= 1
		}
	}
	if(hunger >= 100) {
		hunger = 100
		logError("Game over")
	}

	if(goals[goals_completed]) {
		goals[goals_completed].check()
	}

	if(gathering_notifications.length) {
		for(i=0; i<gathering_notifications.length; i++) {
			if(Date.now()/1000 < gathering_notifications[i].timeout) {
				ctx.font = "10px Arial"
				ctx.fillStyle = "green"
				let width = ctx.measureText(gathering_notifications[i].message).width
				ctx.fillText(gathering_notifications[i].message, gathering_notifications[i].x - (hero.x - 300) - width/3, gathering_notifications[i].y - (hero.y - 300))
				gathering_notifications[i].y -= 1
			} else {
				gathering_notifications.splice(0, 1)
			}
		}
	}

	if(chunk["trees"].length < markers["trees"].number) {
		let roll = 1000*Math.random()
		if(roll < 1) {
			let closest_dist = 100000
			let x, y
			while(closest_dist == 100000 || closest_dist < 10) {
				let roll2 = 1000*Math.random()
				if(roll2 > 500) {
					let closest_tree_dist = 100000
					while(closest_tree_dist == 100000 || closest_tree_dist < 15) {
						let roll3 = Math.floor((chunk["trees"].length - 1)*Math.random())
						x = chunk["trees"][roll3].x + 75 - 150*Math.random()
						y = chunk["trees"][roll3].y + 75 - 150*Math.random()

						for(k = 0; k < chunk["trees"].length; k++) {
							diffx = chunk["trees"][k].x - x
							diffy = chunk["trees"][k].y - y
							dist = Math.sqrt(diffx*diffx + diffy*diffy)

							if(closest_tree_dist == 100000 || dist < closest_tree_dist) {
								if(closest_tree_dist < 1) {
									closest_tree_dist = 100000
									break
								} else {
									closest_tree_dist = dist
								}
							}
						}
					}
				} else {
					x = 50 + 1200*Math.random()
					y = 50 + 1200*Math.random()
				}
				for(k = 0; k < chunk["water"].length; k++) {
					diffx = chunk["water"][k].x - x
					diffy = chunk["water"][k].y - y
					dist = Math.sqrt(diffx*diffx + diffy*diffy)

					if(closest_dist == 100000 || dist < closest_dist) {
						if(closest_dist < 1) {
							closest_dist = 100000
							break
						} else {
							closest_dist = dist
						}
					}
				}
			}
			let obj = Object.assign({}, markers["trees"])
			delete obj.number
			obj.x = x
			obj.y = y
			chunk["trees"].push(obj)
		}
	}

	for(i=0; i<chunk["farm"].length; i++) {
		let keys = Object.keys(chunk["farm"][i].inventory)
		if(keys.length && keys.includes("seed") && chunk["farm"][i]["inventory"].seed > 0) {
			if(Date.now()/1000 > chunk["farm"][i].cooldown) {
				chunk["farm"][i]["inventory"].vegetable = chunk["farm"][i]["inventory"].seed
				gathering_notifications.push({message: "+" + chunk["farm"][i]["inventory"].seed + " vegetable", timeout: Date.now()/1000 + 1, x: chunk["farm"][i].x + 32, y: chunk["farm"][i].y - 32})
				chunk["farm"][i]["inventory"].seed = 0
				let space = 10
				for(j in inventory) {
					space -= inventory[j]
				}
				if(chunk["farm"][i]["inventory"].vegetable % space != 0) {
					commands.splice(0, 0, {verb: "store", number: chunk["farm"][i]["inventory"].vegetable % space, noun: "vegetable", finished: false})
					commands.splice(0, 0, {verb: "retrieve", number: chunk["farm"][i]["inventory"].vegetable % space, noun: "vegetable", details: "farm", finished: false})
					callStack += 2
				}
				for(j=0; j<Math.floor(chunk["farm"][i]["inventory"].vegetable/space); j++) {
					commands.splice(0, 0, {verb: "store", number: space, noun: "vegetable", finished: false})
					commands.splice(0, 0, {verb: "retrieve", number: space, noun: "vegetable", details: "farm", finished: false})
					callStack += 2
				}
			}
		}
	}

	if(Date.now()/1000 > chunk["plants"][0].refresh) {
		let closest_dist = 100000
		let x, y
		while(closest_dist == 100000 || closest_dist < 10) {
			x = 50 + 500*Math.random()
			y = 50 + 500*Math.random()
			for(j = 0; j < chunk["water"].length; j++) {
				diffx = chunk["water"][j].x - x
				diffy = chunk["water"][j].y - y
				dist = Math.sqrt(diffx*diffx + diffy*diffy)

				if(closest_dist == 100000 || dist < closest_dist) {
					if(closest_dist < 1) {
						closest_dist = 100000
						break
					} else {
						closest_dist = dist
					}
				}
			}
		}
		chunk["plants"][0].x = x
		chunk["plants"][0].y = y
		chunk["plants"][0].refresh = Date.now()/1000 + 2.5
	}

	for(i=0; i<chunk["deer"].length; i++) {
		if(chunk["deer"][i].trajectory.angle > 0) {
			chunk["deer"][i].trajectory.angle -= Math.floor(chunk["deer"][i].trajectory.angle/(2*Math.PI))*(2*Math.PI)
		} else {
			chunk["deer"][i].trajectory.angle -= Math.ceil(chunk["deer"][i].trajectory.angle/(2*Math.PI))*(2*Math.PI)
		}

		let avg = 0
		let tot_in_range = 0
		for(j=0; j<chunk["deer"].length; j++) {
			if(i != j) {
				xdif = chunk["deer"][j].x - chunk["deer"][i].x
				ydif = chunk["deer"][j].y - chunk["deer"][i].y
				dist = Math.sqrt(xdif*xdif - ydif*ydif)
				if(dist < 250) {
					tot_in_range += 1
					avg += chunk["deer"][j].trajectory.angle
				}
			}
		}
		if(tot_in_range > 0) {
			avg = avg/tot_in_range
		}

		chunk["deer"][i].trajectory.turning += (.5 - Math.random())/200
		if(Math.abs(chunk["deer"][i].trajectory.turning) > .02) {
			chunk["deer"][i].trajectory.turning = chunk["deer"][i].trajectory.turning/2
		}
		if(avg) {
			chunk["deer"][i].trajectory.angle = .99*chunk["deer"][i].trajectory.angle + .01*avg
		}

		chunk["deer"][i].trajectory.angle += chunk["deer"][i].trajectory.turning

		if(chunk["deer"][i].x < 0) {
			chunk["deer"][i].x = 0
			chunk["deer"][i].trajectory.angle += Math.PI
		} else if(chunk["deer"][i].x > 1200) {
			chunk["deer"][i].x = 1200
			chunk["deer"][i].trajectory.angle += Math.PI
		}
		if(chunk["deer"][i].y < 0) {
			chunk["deer"][i].y = 0
			chunk["deer"][i].trajectory.angle += Math.PI
		} else if(chunk["deer"][i].y > 1200) {
			chunk["deer"][i].y = 1200
			chunk["deer"][i].trajectory.angle += Math.PI
		}
		let y = chunk["deer"][i].y
		for(j=0; j<chunk["water"].length; j++) {
			xdif = chunk["water"][j].x - chunk["deer"][i].x
			ydif = chunk["water"][j].y - chunk["deer"][i].y
			dist = Math.sqrt(xdif*xdif + ydif*ydif)

			if(dist < 10) {
				chunk["deer"][i].trajectory.angle += Math.PI
				break
			}
		}

		chunk["deer"][i].x += 2*Math.cos(chunk["deer"][i].trajectory.angle)/10
		chunk["deer"][i].y += 2*Math.sin(chunk["deer"][i].trajectory.angle)/10
	}

	if(hero.targetx && hero.targety && (Math.abs(hero.x - hero.targetx) > 5 || Math.abs(hero.y - hero.targety) > 5)) {
		angle = Math.atan2(hero.targety - hero.y, hero.targetx - hero.x)
		hero.x += 5*Math.cos(angle)
		hero.y += 5*Math.sin(angle)
	} else {
		hero.targetx = undefined
		hero.targety = undefined
	}

	if(commands.length) {
		try {
			executeCommands(commands[0].verb, commands[0].number, commands[0].noun, commands[0].details)
		} catch(e) {
			console.log(e)
			for(i=0; i<callStack; i++) {
				commands[i].finished = true
			}
			commands.splice(0, callStack)
			callStack = 0
		}
		if(commands.length && commands[0].finished) {
			callStack -= 1
			commands.splice(0, 1)
		}
	}
}
var then = Date.now()
var main = function() {
  var now = Date.now(),
    delta = (now - then)/1000

  ctx = this.canvas.getContext("2d")

  createCanvas()
	if(currentPage == "home") {
  	update(delta)
	}

  then = now

  window.requestAnimationFrame(main)
}

window.onload = function() {
	document.getElementById("cv").addEventListener("click", function(event) {
		var x = event.offsetX,
			y = event.offsetY
			for(var page in pages) {
				if(page == currentPage) {
					pages[page].checkForPress(x, y)
					break
				}
			}
	})

	canvas = document.getElementById("cv")

	main()
}

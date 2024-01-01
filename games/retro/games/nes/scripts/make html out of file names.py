# List of NES games
nes_games = [
    "Adventure Island II (USA)",
    "Adventures of Lolo (USA)",
    "Adventures of Rad Gravity, The (USA)",
    "Aladdin (Unl)",
    "Bad Dudes (USA)",
    "Balloon Fight (USA)",
    "Batman - The Video Game (USA)",
    "Battle of Olympus, The (USA)",
    "BattleCity (Japan)",
    "Binary Land (Japan)",
    "Bionic Commando (USA)",
    "Bomberman II (USA)",
    "Bubble Bobble (USA)",
    "Bucky O'Hare (USA)",
    "BurgerTime (USA)",
    "Cabal (USA)",
    "Captain Skyhawk (USA) (Rev 1)",
    "Chip 'n Dale - Rescue Rangers (USA)",
    "Chou-Wakusei Senki - MetaFight (Japan)",
    "Circus Charlie (Japan)",
    "Clash at Demonhead (USA)",
    "Commando (USA)",
    "Crisis Force (Japan)",
    "Crystalis (USA)",
    "Darkwing Duck (USA)",
    "Deadpool (Unl)",
    "Die Hard (USA)",
    "Dig Dug (Japan)",
    "Dragon Spirit - The New Legend (USA)",
    "DuckTales (USA)",
    "Elevator Action (USA)",
    "Faxanadu (USA) (Rev 1)",
    "Felix the Cat (USA)",
    "Fire 'n Ice (USA)",
    "Flintstones, The - The Rescue of Dino & Hoppy (USA)",
    "G.I. Joe - A Real American Hero (USA)",
    "Gargoyle's Quest II (USA)",
    "Ghosts'n Goblins (USA)",
    "Gimmick (Japan)",
    "Goonies (Japan)",
    "Guardian Legend, The (USA)",
    "Guerrilla War (USA)",
    "Gun Nac (USA)",
    "Gun.Smoke (USA)",
    "Hebereke (Japan)",
    "Ice Climber (USA, Europe, Korea) (En)",
    "Jackal (USA)",
    "Journey to Silius (USA)",
    "KickMaster (USA)",
    "Kid Icarus (USA, Europe) (Rev 1)",
    "Kirby's Adventure (USA) (Rev 1)",
    "Kung Fu (Japan, USA) (En)",
    "Legend of Kage, The (USA)",
    "Lemmings (USA)",
    "Life Force (USA) (Rev 1)",
    "Little Mermaid, The (USA)",
    "Little Nemo - The Dream Master (USA)",
    "Little Samson (USA)",
    "Lode Runner (USA)",
    "Mad City (Japan)",
    "Magic of Scheherazade, The (USA)",
    "Maniac Mansion (USA)",
    "Mappy (Japan)",
    "Marble Madness (USA)",
    "Metal Gear (USA)",
    "Metal Storm (USA)",
    "Metroid (USA)",
    "Mickey Mousecapade (USA).nes",
    "Mighty Final Fight (USA).nes",
    "Moai-kun (Japan).nes",
    "Ms. Pac-Man (USA) (Tengen) (Unl).nes",
    "North and South (USA).nes",
    "Nuts & Milk (Japan).nes",
    "Over Horizon (Japan).nes",
    "Paperboy (USA).nes",
    "Pirates (USA).nes",
    "Popeye (World) (Rev 1).nes",
    "Power Blade (USA).nes",
    "Prince of Persia (USA).nes",
    "Princess Tomato in the Salad Kingdom (USA).nes",
    "Radia Senki - Reimei Hen (Japan).nes",
    "Rampage (USA).nes",
    "Rampart (USA) (Jaleco).nes",
    "Rescue - The Embassy Mission (USA).nes",
    "Robin Hood - Prince of Thieves (USA) (Rev 1).nes",
    "Rollergames (USA).nes",
    "Rush'n Attack (USA).nes",
    "Rygar (USA) (Rev 1).nes",
    "S.C.A.T. - Special Cybernetic Attack Team (USA).nes",
    "Shadow of the Ninja (USA).nes",
    "Shadowgate (USA).nes",
    "Shatterhand (USA).nes",
    "Smash T.V. (USA).nes",
    "Snake Rattle n Roll (USA).nes",
    "Sonic the Hedgehog (Unl).nes",
    "Spelunker (USA).nes",
    "StarTropics (USA).nes",
    "Street Fighter 2010 - The Final Fight (USA).nes",
    "Street Fighter II (Unl).nes",
    "Strider (USA).nes",
    "Super Pitfall (USA).nes",
    "Tetris (USA).nes",
    "Tiny Toon Adventures (USA).nes",
    "Trojan (USA).nes",
    "Urban Champion (World).nes",
    "Vice - Project Doom (USA).nes",
    "Wizards & Warriors (USA) (Rev 1).nes",
    "Wrecking Crew (World).nes",
    "Yie Ar Kung-Fu (Japan) (Rev 1.4).nes",
    "Zen - Intergalactic Ninja (USA).nes",
]

# Generate HTML code
html_code = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NES Game Downloads</title>
</head>
<body>

    <h1>NES Game Downloads</h1>

    <ul>
"""

for game in nes_games:
    html_code += f"""
        <!-- {game} -->
        <li><a href="/nes/{game.replace(" ", "").replace("(", "").replace(")", "")}.nes" download="{game.replace("(", "").replace(")", "")}.nes"><button class="btn"><i class="fa fa-download"></i>{game}</button></a></li>
        <p></p>
"""

html_code += """
    </ul>

</body>
</html>
"""

# Save HTML code to a file
with open("nes_games.html", "w") as file:
    file.write(html_code)

print("HTML code generated and saved to 'nes_games.html'")

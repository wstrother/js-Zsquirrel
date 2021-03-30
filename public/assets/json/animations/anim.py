import json

newAnimations = {}


def parse_rect(data):
    offset = data["offset"]
    mirror = data.get("mirror")
    x, y, w, h = data["rect"]

    output = {
        "offset": offset,
        "rect": [w, h, x, y]
    }
    if mirror:
        output["mirror"] = mirror

    return output


def parse_frame(data):
    length = data["frameLength"]
    rects = data["frame"]
    rects = [parse_rect(r) for r in rects]

    return {
        "frameLength": length,
        "rects": rects
    }


def parse_animation(data):
    print(data["name"])
    frames = [parse_frame(f) for f in data["frames"]]
    return {
        "name": data["name"],
        "frames": frames
    }


with open('link_animation.json') as file:
    DATA = json.load(file)

    DATA["animations"] = [parse_animation(a) for a in DATA["animations"] if "left" not in a["name"]]

with open('new_link.json', 'w') as file:
    json.dump(DATA, file, indent=2)

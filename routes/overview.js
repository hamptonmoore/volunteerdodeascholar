const Work = require("../models/Work");
const User = require("../models/User");
const Class = require("../models/Class");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = {};
module.exports.GET = function(req, res) {
	let sinceDate = new Date(req.query.since).valueOf() / 1000 || 0;
	Class.findAll({ where: { teacherID: req.session.user.userid } }).then(
		classIDs => {
			let studentIDs = [];
			for (let i in classIDs) {
				studentIDs.push({ userid: classIDs[i].studentID });
			}

			for (let i in classIDs) {
				studentIDs.push({ userid: classIDs[i].studentID });
			}
			User.findAll({
				where: { [Op.or]: studentIDs }
			}).then(students => {
				Work.findAll({
					where: { [Op.or]: studentIDs, start: { [Op.gte]: sinceDate } }
				}).then(works => {
					let studentData = [];
					let totalTime = 0;
					for (let i in students) {
						studentData[students[i].userid] = students[i];
						studentData[students[i].userid].total = 0;
						studentData[students[i].userid].count = 0;
					}
					for (let i in works) {
						studentData[works[i].userid].total += works[i].time;
						studentData[works[i].userid].count++;
						totalTime += works[i].time;
					}
					for (let i in studentData) {
						studentData[i].time = [
							Math.floor(studentData[i].total / 3600).toString().padStart(2, "0"),
							Math.floor((studentData[i].total % 3600) / 60).toString().padStart(2, "0")
						];
					}

					studentData.sort(function(a, b) {
						var x = a.name.toLowerCase();
						var y = b.name.toLowerCase();
						return x < y ? -1 : x > y ? 1 : 0;
					});

					let view = "overviewList";

					res.render(view, {
						layout: "default",
						session: req.session.user,
						totalTime: Math.floor(totalTime / 3600),
						since: req.query.since,
						profileQueries: req.query.since ? "?since=" + req.query.since : "",
						students: studentData
					});
				});
			});
		}
	);
};

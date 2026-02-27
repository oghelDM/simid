const gulp = require("gulp");
const ftp = require("vinyl-ftp");
const crypto = require("crypto");
const gutil = require("gulp-util");
const argv = require("yargs").argv;
const rename = require("gulp-rename");
const replace = require("gulp-replace");
const modifyFile = require("gulp-modify-file");

gulp.task("default", function (arg) {
	gutil.log("start gulp: ", arg);

	const year = argv.year;
	const campaign = argv.campaign;
	const version =
		typeof argv.creativeVersion === "boolean" ? "" : argv.creativeVersion; // empty string is cast as True Boolean for whatever reason...
	const buildFolder = version ? `builds/${version}` : "builds";
	const duration = (argv.duration || "20").toString().padStart(2, "0"); // make sure that the duration is always two characters long
	const isTakeOver = argv.isTakeOver;

	console.log("year: ", year);
	console.log("campaign: ", campaign);
	console.log("version: ", version);
	console.log("duration: ", duration);
	console.log("buildFolder: ", buildFolder);
	console.log("isTakeOver: ", isTakeOver);

	// connect to the CDN
	const conn = ftp.create({
		host: "statics.adm.dailymotion.com",
		user: process.env.CDN_STUDIO_USER,
		password: process.env.CDN_STUDIO_PSWD,
		parallel: 10,
		port: 21,
		reload: true,
		// debug: function (d) {
		// 	console.log("qqq", d);
		// },
		secureOptions: { rejectUnauthorized: false },
		secure: true,
		// log: gutil.log,
	});

	const uuid = crypto.randomUUID();
	const adServingId = `StudioDM-${uuid}`;
	const shortUuid = uuid.substring(0, 4);
	const destinationUrl = `/PRODUCTION/${year}/${campaign}/${buildFolder}/${shortUuid}`;

	const indexUrl = `https://statics.dmcdn.net/d${destinationUrl}/index.js`;
	const vastInputFileName = isTakeOver
		? "vast_take_over.xml"
		: "vast_simid.xml";
	const vastSourceUrl = `./deploy/${vastInputFileName}`;

	const vastOutputFileNames = isTakeOver
		? ["vast_mobile.xml", "vast_desktop.xml"]
		: ["vast_simid.xml"];

	const videoPrefixUrl = `https://statics.dmcdn.net/d/PRODUCTION/${year}/${campaign}/assets${version ? "_" + version : ""}/`;
	console.log("videoPrefixUrl: ", videoPrefixUrl);

	const htmlUrl = `https://statics.dmcdn.net/d/PRODUCTION/${year}/${campaign}/${buildFolder}/${shortUuid}/creative.html`;
	console.log("htmlUrl: ", htmlUrl);

	vastOutputFileNames.forEach((vastOutputFileName) => {
		gulp.src(vastSourceUrl, { passthrough: true })
			.pipe(
				modifyFile((content) => {
					const updatedContent = content
						.toString()
						.replaceAll("{campaignName}", campaign)
						.replaceAll("{version}", version || "v1.0")
						.replaceAll("{indexUrl}", indexUrl)
						.replaceAll("{duration}", duration)
						.replaceAll("{videoPrefixUrl}", videoPrefixUrl)
						.replaceAll("{htmlUrl}", htmlUrl)
						.replaceAll("{adServingId}", adServingId);
					return updatedContent;
				}),
			)
			.pipe(rename(vastOutputFileName))
			.pipe(conn.dest(destinationUrl));
	});

	// copy the vast url to clipboard
	const vastDestinationUrl = `https://statics.dmcdn.net/d/PRODUCTION/${year}/${campaign}/${buildFolder}/${shortUuid}/${vastOutputFileNames[0]}`;
	console.log("vast url mobile: ", vastDestinationUrl);
	console.log(
		"vast url desktop: ",
		vastDestinationUrl.replace("mobile", "desktop"),
	);
	console.log(
		"demo link: ",
		`https://statics.dmcdn.net/d/services/public/demoSite/current/index.html?device=${
			isTakeOver ? "1&env=OLV" : "0"
		}&DM=true&url=${year}/${campaign}/${buildFolder}/${shortUuid}/${
			vastOutputFileNames[0]
		}`,
	);
	const proc = require("child_process").spawn("pbcopy");
	proc.stdin.write(vastDestinationUrl);
	proc.stdin.end();

	gulp.src(["build/creative.html"], { base: "./build", buffer: false }).pipe(
		conn.dest(destinationUrl),
	);

	return (
		gulp
			.src(["build/creative.js"], { base: "./build", buffer: false })
			// force a random query string to make sure assets are not in user's cache
			.pipe(replace("?q=CACHE_QUERY", `?q=${shortUuid}`))
			.pipe(conn.dest(destinationUrl))
	);
});

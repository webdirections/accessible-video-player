<!DOCTYPE html>
<html>
	<head>
		<title>Accessible Video Content Player</title>
		<meta charset="utf-8"/>
		<link href="style/tabs.css" rel="stylesheet">
		<link href="style/app.css" rel="stylesheet">
		<link href="style/media.css" rel="stylesheet">
		
		<script defer src='js/tabs.js'></script>
		
		<script defer src='js/app.js'></script>
		<script defer src="https://player.vimeo.com/api/player.js"></script>

	</head>
	<body>
        <header>
            <h1>OzeWAI</h1>
        </header>
        <main>
			<iframe title="Product://Remote Week 3" src="https://vimeo.com/event/445555/embed/f90347a978?controls=1&hd=1&autohide=1" width="640" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen id="video" class="fluid-width-video-wrapper"> </iframe>
						<?php include('includes/captions.php'); ?>

        </main>

		<section role="complementary" title="Transcript, Concepts and Slides">
		<div class="tabs">
			<div role="tablist" aria-label="content-controls">
				<button role="tab"
					aria-selected="true"
					aria-controls="transcript-tab"
					id="transcript-button">
				Transcript
				</button>
				<button role="tab"
					aria-selected="false"
					aria-controls="concepts-tab"
					id="concepts-button"
					tabindex="-1">
				Concepts
				</button>
				<button role="tab"
					aria-selected="false"
					aria-controls="slides-tab"
					id="slides-button"
					tabindex="-1">
				Slides
				</button>
				
				<label><span>Closed Captions</span><input type="checkbox" id="captionToggle"></label>
				<label><span>AutoScroll Content</span><input type="checkbox" id="scrollToggle" checked></label>

			</div>
			<div tabindex="0"
				role="tabpanel"
				id="transcript-tab"
				aria-labelledby="transcript-button">
				<?php include('includes/transcripts.php'); ?>
			</div>
			<div tabindex="0"
				role="tabpanel"
				id="concepts-tab"
				aria-labelledby="concepts-button"
				hidden="">
				<?php include('includes/concepts.php'); ?>
			</div>
			<div tabindex="0"
				role="tabpanel"
				id="slides-tab"
				aria-labelledby="slides-button"
				hidden="">
				<?php include('includes/slides.php'); ?>
			</div>			
		</div>
		</section>
	</body>
</html>


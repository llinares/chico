<?php

/**
 *    Chico-UI 
 *    Documentation Packer-o-matic "Automatic papá"
 */

class DocBuilder {
	private $version = "0.1";
	private $autor = "Chico Team <chico@mercadolibre.com>";
	
	private $pages = "dropdown, tabnavigator, carousel";
	private $files;
	private $template;
	
	/**
     * Constructor
     */

    function __construct() {
        
    	$this->files = explode(", ", $this->pages);
    	$this->template = file_get_contents("template.html");
    	
    	foreach ($this->files as $file) {
			
			// Uses & Name
			$use = file_get_contents($file."/use.html");
			$use = explode("<h1>", $use);
			$name = explode("</h1>", $use[1]);
			$use = explode("</body>", $name[1]);
			
			$html = str_replace("<!-- #name -->", $name[0], $this->template);
			$html = str_replace("<!-- #use -->", $use[0], $html);
			
			// Demo
			$demo = file_get_contents($file."/demo.html");
			$demo = explode("<body>", $demo);
			$demo_html = explode("<script>", $demo[1]);	
			$demo_js = explode("</script>", $demo_html[1]);
			
			$html = str_replace("<!-- #demo-html -->", $demo_html[0], $html);
			$html = str_replace("<!-- #demo-js -->", "<script>".$demo_js[0]."</script>", $html);
			
			// Sintax
			$sintax = file_get_contents($file."/sintax.html");
			$sintax = explode("<body>", $sintax);
			$sintax_html = explode("<!-- #codes -->", $sintax[1]);
			$sintax_js = explode("</body>", $sintax_html[1]);
			
			$html = str_replace("<!-- #sintax-html -->", $sintax_html[0], $html);
			$html = str_replace("<!-- #sintax-js -->", $sintax_js[0], $html);
			
			// Config
			$config = file_get_contents($file."/config.html");
			$config = explode("<body>", $config);
			$config = explode("</body>", $config[1]);
			$html = str_replace("<!-- #config -->", $config[0], $html);
			
			// Cases
			$casesQuantity = count(glob($file."/cases/case*.html"));
			
			if($casesQuantity > 0){
				$cases = array();
				
				for($i = 0; $i < $casesQuantity; $i += 1){
				
					$case = file_get_contents($file."/cases/case".($i + 1).".html");
					$case = explode("<body>", $case);
					$case_html = explode("<script>", $case[1]);	
					$case_js = explode("</script>", $case_html[1]);
					
					$self = "<div class=\"ch-g2-3\">".$case_html[0]."</div>";
					$self.= "<div class=\"ch-g1-3\"><p>El javascript para iniciarlo es:</p>";
					$self.= "<code><pre name=\"code\" class=\"js\">".$case_js[0]."</pre></code></div>";
			
					array_push($cases, $self);
				};
				
				$cases = "<div class=\"ch-g1\"><div class=\"box clearfix\"><h3>Casos de uso</h3>".implode("", $cases)."</div></div>";
				
				$html = str_replace("<!-- #cases -->", $cases, $html);
			};
			
			// File creation
			$filename = $file.".html";
			$chars = file_put_contents($filename, $html);
			echo "<p><a href=\"".$filename."\">".$filename."</a> <small>(".$chars." bytes)</small></p>";
    	};
    }
};

// Execution
new DocBuilder();

?>

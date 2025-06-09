import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid2 from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

import Science from '@mui/icons-material/Science';
import Troubleshoot from '@mui/icons-material/Troubleshoot';

import Banner from "../Images/Banner.png";

function Home() {
  return (
    <>
    <Box
      sx={{
        backgroundColor: '#33092d',
        overflow: 'hidden',
        display: 'flex',              // flexbox layout
        justifyContent: 'center',     // center horizontally
        alignItems: 'center',         // center vertically
      }}
    >
      <img
        alt="Sparkmap"
        src={Banner}
        style={{
          maxHeight: '100%',
          maxWidth: '100%',
          objectFit: 'cover',
        }}
      />
    </Box>
     <Box
      sx={{
        backgroundColor: 'black',
        py: 6,
      }}
    >
      <Grid2 container spacing={12} alignItems="center" justifyContent="center">
        {/* Left Section */}
        <Grid2 item xs={12} md={5}>
          <Box display="flex" alignItems="center" gap={2}>
            <Troubleshoot sx={{ color: 'white', fontSize: { xs: 50, md: 70 } }} />
            <Typography
              sx={{
                color: 'white',
                maxWidth: 300,           // forces 2-ish lines
                fontSize: { xs: '1rem', md: '1.2rem' },
              }}
            >
              Begin your journey of discovery into the endless possibilities of a new way of thinking.
            </Typography>
          </Box>
        </Grid2>

        {/* Divider */}
        <Grid2 item xs={12} md={2}>
          <Box
            sx={{
              height: '100px',
              width: "3px",
              backgroundColor: 'white',
            }}
          />
        </Grid2>

        {/* Right Section */}
        <Grid2 item xs={12} md={5}>
          <Box display="flex" alignItems="center" gap={2}>
            <Science sx={{ color: 'white', fontSize: { xs: 50, md: 70 } }} />
            <Typography
              sx={{
                color: 'white',
                maxWidth: 300,
                fontSize: { xs: '1rem', md: '1.2rem' },
              }}
            >
              Experiment, Tinker, and Play with the proliferate settings and options.
            </Typography>
          </Box>
        </Grid2>
      </Grid2>
    </Box>
    <Box sx={{backgroundColor: 'white', p:5}}>
            <Typography variant="h2" sx={{mb:3}} gutterBottom>
                Welcome to Sparkmap.
            </Typography>
            <Typography sx={{color: '#666', mb: 4}}>
                Thus begins your journey into the unexplored depths of your own mind. What seems like a simple interface holds immense power. Discover hidden intricacies, subtle connections, and profound insights. See complex topics from new angles. Uncover unexpected relationships. SparkMap isn't just a tool — it's a new way of thinking. You've never seen anything like it.
            </Typography>
            <Typography sx={{color: '#666', mb: 4}}>
                At its core, SparkMap is simple: you connect nodes together. It might look like an indented list — but that’s just the surface. Underneath, it’s something richer. With intuitive, purpose-built editing tools, SparkMap lets you build intricate webs of meaning. This isn’t just a list. It’s a living map of connections.
           </Typography>
            <Typography sx={{color: '#666', mb:4}}>
                SparkMap shares the spirit of a mind map, though it breaks free from the traditional layout. It draws inspiration from Tony Buzan’s pioneering work, but reimagines it for the digital age. More than just a tool, it’s a new way of thinking — limited only by your imagination.
           </Typography>
            <Typography sx={{color: '#666', mb:4}}>
               You might think of it as an alternative to a spreadsheet — but more visual, more flexible. A new way to store, explore, and evolve your ideas.
            </Typography>
    </Box>
    <Box sx={{backgroundColor: '#eaeaea', p:5}}>
            <Grid2 container spacing={2} width='100%'>
                <Grid2 size={4}>
                    <Paper sx={{p: 3}}>
                        <Typography variant="h4" sx={{pb: 3}}>
                            Fully Collaborative
                        </Typography>
                        <Typography>
                            Share, remix, and build together in real time. Whether you're brainstorming with a friend or coordinating with a team, SparkMap makes collaboration seamless — with endless ways to work together.
                        </Typography>
                    </Paper>
                </Grid2>
                <Grid2 size={4}>
                    <Paper sx={{p: 3}}>
                        <Typography variant="h4" sx={{pb: 3}}>
                            Regular Updates
                        </Typography>
                        <Typography>
                           SparkMap is constantly evolving. New features drop regularly, so check the Docs page to stay up to date. We're always exploring fresh, more effective ways to help you think and create.
                        </Typography>
                    </Paper>
                </Grid2>
                <Grid2 size={4}>
                    <Paper sx={{p: 3}}>
                        <Typography variant="h4" sx={{pb: 3}}>
                            Just the beginning
                        </Typography>
                        <Typography>
                            This is only the beginning. SparkMap is in its early days, and the roadmap ahead is <b>PACKED</b> with powerful new features, smarter tools, and entirely new ways of working. Big ideas are coming — and you're here at the start.
                        </Typography>
                    </Paper>
                </Grid2>
            </Grid2>
    </Box>
    </>
  );
}

export default Home;
